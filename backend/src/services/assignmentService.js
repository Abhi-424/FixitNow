const User = require('../models/User');
const Booking = require('../models/Booking');

/**
 * Find the best provider for a booking
 * @param {string} serviceId - The ID of the service
 * @param {Array<number>} coordinates - [longitude, latitude] of the booking location
 * @param {Date} date - The date of the booking
 * @param {string} timeSlot - The time slot required (e.g. "10:00")
 * @param {Array<string>} excludedProviderIds - List of provider IDs to exclude (e.g. rejected)
 * @returns {Promise<User|null>} - The assigned provider or null
 */
const findBestProvider = async (serviceId, coordinates, date, timeSlot, excludedProviderIds = []) => {
    try {
        console.log(`Finding provider for Service: ${serviceId}, Excluded: ${excludedProviderIds.length}`);

        const maxDistance = 20000; // 20km search radius
        
        // Format date to string YYYY-MM-DD
        const dateStr = new Date(date).toISOString().split('T')[0];

        // 1. Find potential providers
        const pipeline = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: coordinates },
                    distanceField: "distance",
                    maxDistance: maxDistance,
                    spherical: true,
                    query: {
                        role: 'provider',
                        status: 'Verified',
                        // servicesOffered: new mongoose.Types.ObjectId(serviceId), // Handled in match
                        _id: { $nin: excludedProviderIds }
                    }
                }
            },
            // Match Service and Availability
            {
                $match: {
                   servicesOffered: serviceId, // Auto-cast by mongoose usually, but better safe if using aggregate
                   // Availability Check: 
                   // Must have an entry in 'availability' array where date matches AND slots matches
                   "availability": {
                       $elemMatch: {
                           date: dateStr,
                           slots: timeSlot
                       }
                   }
                }
            },
            // Lookup active bookings to ensure no double booking
            // (Optional complex check: ensure they don't have a booking at this time)
            // For MVP, we presume the availability slot availability implies they are free.
            
            // Limit to closest 10 for scoring
            { $limit: 10 }
        ];

        // Since we need complex availability filtering that Mongoose find/aggregate might struggle with 
        // if schema is complex, let's stick to a simpler find first if aggregate is risky without exact schema knowledge.
        // But $geoNear requires aggregation or special find.
        
        // Let's use standard find with $near which is easier for now, then filter in memory for complex rules
        const providers = await User.find({
            role: 'provider',
            status: 'Verified',
            servicesOffered: serviceId,
            _id: { $nin: excludedProviderIds },
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: coordinates },
                    $maxDistance: maxDistance
                }
            },
            // Availability Check
            availability: {
                $elemMatch: {
                   date: dateStr,
                   slots: timeSlot
                }
            }
        }).limit(10); // Find top 10 closest eligible providers

        if (providers.length === 0) {
            console.log('No providers found matching criteria.');
            return null;
        }

        console.log(`Found ${providers.length} potential providers. Scoring...`);

        // 2. Score and Sort
        // Factors: 
        // - Distance (already sorted by $near, implies 0 index is closest)
        // - Rating (Higher is better)
        // - Last Assigned (Fairness: null or older is better)

        const scoredProviders = providers.map(p => {
             // Calculate a score
             let score = 0;
             
             // Rating weight (0-5) * 10 -> 0-50 pts
             score += (p.rating || 0) * 10;
             
             // Fairness penalty
             // If recently assigned, lower score.
             if (p.lastAssignedAt) {
                 const hoursSinceLastJob = (Date.now() - new Date(p.lastAssignedAt)) / (1000 * 60 * 60);
                 if (hoursSinceLastJob < 24) {
                     score -= 20; // Penalize if worked today
                 }
             } else {
                 score += 10; // Boost if never assigned
             }

             return { provider: p, score };
        });

        // Sort by Score DESC
        scoredProviders.sort((a, b) => b.score - a.score);

        const bestMatch = scoredProviders[0].provider;
        console.log(`Best match: ${bestMatch.username} (Score: ${scoredProviders[0].score})`);

        return bestMatch;

    } catch (error) {
        console.error('Error finding provider:', error);
        throw error; // Propagate up
    }
};

/**
 * Reassign a booking after rejection
 * @param {string} bookingId 
 */
const reassignBooking = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId).populate('serviceId');
        if (!booking) return;

        console.log(`Attempting reassignment for Booking ${booking.id}`);

        // Get currently rejected providers
        const excluded = [...booking.rejectedProviders];
        // Add current provider if not already in rejected (should be added by controller before calling this)
        if (booking.provider && !excluded.includes(booking.provider)) {
            excluded.push(booking.provider);
        }

        const bestProvider = await findBestProvider(
            booking.serviceId._id || booking.serviceId, // Handle populated or not
            booking.location.coordinates,
            booking.scheduledDate,
            "10:00", // TODO: Extract time from booking if stored separately or default
            excluded
        );

        if (bestProvider) {
            console.log(`Reassigning to ${bestProvider.username}`);
            booking.provider = bestProvider._id;
            booking.status = 'Auto-Assigned';
            booking.lastAssignedAt = new Date(); // Reset timestamp
            
            // Update provider's last assigned
            await User.findByIdAndUpdate(bestProvider._id, { lastAssignedAt: new Date() });

        } else {
            console.log('No replacement provider found.');
            booking.provider = null;
            booking.status = 'Pending'; // Back to pool
        }

        await booking.save();
        return booking;

    } catch (error) {
        console.error('Reassignment failed:', error);
    }
};

module.exports = { findBestProvider, reassignBooking };
