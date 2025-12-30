const Booking = require('../models/Booking');
const User = require('../models/User');

// Get all bookings for logged-in user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('provider', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get all bookings assigned to provider OR available in pool
const getProviderBookings = async (req, res) => {
  try {
    // Find bookings where:
    // 1. Provider is assigned to this user (Assigned jobs)
    // 2. Provider is null AND status is 'Pending' (Open requests) - ONLY IF VERIFIED

    const canViewPool = req.user.role === 'provider' && req.user.status === 'Verified';

    const query = {
      $or: [
        { provider: req.user.id }
      ]
    };

    if (canViewPool) {
      query.$or.push({ provider: null, status: 'Pending' });
    }

    const bookings = await Booking.find(query)
      .populate('user', 'username email location')
      .populate('serviceId', 'category basePrice')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

const { geocodeAddress } = require('../services/geocodingService');

const { findBestProvider, reassignBooking } = require('../services/assignmentService');

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { service, serviceId, description, location, scheduledDate, amount, provider } = req.body;

    // Check if user is blocked
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ 
        message: 'Your account has been blocked. Please contact support.' 
      });
    }

    // Handle Location (Geocode if string, or parse if object)
    let bookingLocation = {
      type: 'Point',
      coordinates: [],
      address: ''
    };

    if (typeof location === 'string') {
       // It's just an address string, geocode it
       const geo = await geocodeAddress(location);
       if (geo) {
          bookingLocation.coordinates = [geo.lng, geo.lat];
          bookingLocation.address = geo.display_name || location;
       } else {
          return res.status(400).json({ message: 'Could not find location for address provided.' });
       }
    } else if (location && typeof location === 'object') {
       // It's an object (from frontend LocationPicker or User Profile)
       
       if (location.coordinates && location.coordinates.length === 2 && location.coordinates[0] !== null) {
          // Valid coordinates present
          bookingLocation = location;
       } else if (location.address) {
          // Address present but no coordinates -> Geocode it
          const geo = await geocodeAddress(location.address);
          if (geo) {
             bookingLocation.coordinates = [geo.lng, geo.lat];
             bookingLocation.address = geo.display_name || location.address;
             // Ensure type is set
             bookingLocation.type = 'Point';
          } else {
             return res.status(400).json({ message: 'Could not resolve location coordinates. Please select a point on the map.' });
          }
       } else {
          return res.status(400).json({ message: 'Invalid location data. Address is required.' });
       }
    } else {
       return res.status(400).json({ message: 'Invalid location data' });
    }

    // Auto-Assignment Logic
    let assignedProviderId = provider;
    let bookingStatus = 'Pending';
    
    // If no specific provider requested, find one
    if (!assignedProviderId) {
        try {
            const bestProvider = await findBestProvider(
                serviceId, 
                bookingLocation.coordinates, 
                scheduledDate, 
                "10:00" // Default start time for auto-assign check
            );
            
            if (bestProvider) {
                assignedProviderId = bestProvider._id;
                bookingStatus = 'Auto-Assigned';
                
                // Update provider's last assigned time for fairness
                await User.findByIdAndUpdate(assignedProviderId, { lastAssignedAt: new Date() });
            } else {
                console.log('No provider found for auto-assignment');
                // Remains Pending
            }
        } catch (assignError) {
            console.error('Auto-assignment error:', assignError.message);
            // If auto-assignment fails (e.g., no geospatial index), continue with Pending status
            console.log('Continuing with Pending status due to assignment error');
        }
    } else {
        // ... (Validate specific provider if provided manually - existing logic)
        const providerUser = await User.findById(provider);
        if (!providerUser) {
            return res.status(404).json({ message: 'Selected provider not found' });
        }
        if (providerUser.role !== 'provider' || providerUser.status !== 'Verified') {
             return res.status(400).json({ message: 'Invalid or unverified provider selected.' });
        }
    }

    const booking = new Booking({
      user: req.user.id,
      service: service,      // Service Name
      serviceId: serviceId,  // Service ID
      description,
      location: bookingLocation,
      scheduledDate,
      amount: amount || 0,
      status: bookingStatus,
      provider: assignedProviderId || null,
      lastAssignedAt: assignedProviderId ? new Date() : null,
      userHasSeen: true,
      providerHasSeen: false 
    });

    await booking.save();
    
    // Populate for response
    const populatedBooking = await Booking.findById(booking._id).populate('provider', 'username rating');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Provider Logic
    if (req.user.role === 'provider') {
      
      // Enforce Verified Status
      if (req.user.status !== 'Verified') {
        return res.status(403).json({ message: 'Account not verified. Cannot accept or update jobs.' });
      }

      // 1. Accepting or Declining a pending booking
      if (status === 'Accepted' || status === 'Declined') {
        if (booking.status !== 'Pending') {
          return res.status(400).json({ message: 'Booking is not pending' });
        }
        if (booking.provider && booking.provider.toString() !== req.user.id) {
          return res.status(400).json({ message: 'Booking already assigned to another provider' });
        }
        
         if (status === 'Accepted') {
            booking.provider = req.user.id;
            booking.status = status;
         } else {
            // Declined Logic
            // 1. Add to rejected list
            booking.rejectedProviders.push(req.user.id);
            
            // 2. Save current state briefly (optional, or just pass to reassign)
            await booking.save();

            // 3. Trigger Reassignment
            await reassignBooking(booking._id);
            
            // Return early with the updated booking (which might have a new provider now)
            // refetch because reassignBooking saves it
            const reassignedBooking = await Booking.findById(id)
                .populate('user', 'username email location')
                .populate('serviceId', 'category basePrice');
            
            return res.json(reassignedBooking);
         }
      } 
      // 2. Starting the job
      else if (status === 'In Progress') {
        if (booking.status !== 'Accepted') {
           return res.status(400).json({ message: 'Booking must be accepted first' });
        }
        if (booking.provider.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to start this booking' });
        }
        booking.status = 'In Progress';
      }
      // 3. Completing the job (Waiting for User Confirmation)
      else if (status === 'Waiting for Confirmation') {
        if (booking.status !== 'In Progress') {
           return res.status(400).json({ message: 'Booking must be in progress to complete' });
        }
        if (booking.provider.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to complete this booking' });
        }
        booking.status = 'Waiting for Confirmation';
        booking.technicianCompleted = true;
      }
      else {
        return res.status(400).json({ message: 'Invalid status update for provider' });
      }
    } 
    
    // User Logic
    else if (req.user.role === 'user') {
      // 4. Confirming completion
      if (status === 'Completed') {
        if (booking.status !== 'Waiting for Confirmation') {
           return res.status(400).json({ message: 'technician must complete the job first' });
        }
        if (booking.user.toString() !== req.user.id) {
           return res.status(403).json({ message: 'Not authorized to confirm this booking' });
        }
        booking.status = 'Completed';
        booking.userConfirmed = true;
      }
      // Cancelling
      else if (status === 'Cancelled') {
         if (booking.status === 'Completed' || booking.status === 'In Progress') {
            return res.status(400).json({ message: 'Cannot cancel active or completed bookings' });
         }
         booking.status = 'Cancelled';
      }
      else {
        return res.status(400).json({ message: 'Invalid status update for user' });
      }
    }
    
    // Admin Logic
    else if (req.user.role === 'admin') {
       booking.status = status;
       if (status === 'Pending') {
           booking.provider = null;
           booking.rejectedProviders = []; // Optional: Clear rejections to allow fresh start? Yes.
       }
    }

    // Generic Notification Logic
    if (req.user.role === 'provider') {
       booking.userHasSeen = false;
    } else if (req.user.role === 'user') {
       if (booking.provider) booking.providerHasSeen = false;
    } else if (req.user.role === 'admin') {
       booking.userHasSeen = false;
       if (booking.provider) booking.providerHasSeen = false;
    }

    await booking.save();
    
    // Populate fields for response - Ensure detailed response
    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email location')
      .populate('serviceId', 'category basePrice');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};



// @desc    Mark notifications as read
// @route   PATCH /api/bookings/notifications/read
// @access  Private (User/Provider)
const markNotificationsRead = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const role = req.user.role;
    const userId = req.user.id;

    if (bookingId) {
      const update = role === 'user' ? { userHasSeen: true } : { providerHasSeen: true };
      await Booking.findByIdAndUpdate(bookingId, update);
    } else {
      // Mark all
      if (role === 'user') {
        await Booking.updateMany({ user: userId, userHasSeen: false }, { userHasSeen: true });
      } else if (role === 'provider') {
        await Booking.updateMany({ provider: userId, providerHasSeen: false }, { providerHasSeen: true });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserBookings,
  getProviderBookings,
  createBooking,
  updateBookingStatus,
  markNotificationsRead
};
