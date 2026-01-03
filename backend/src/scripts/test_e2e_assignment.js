const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { findBestProvider } = require('../services/assignmentService');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testBookingCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Pick a service (Plumbing)
        const service = await Service.findOne({ name: /Plumbing/i });
        if (!service) throw new Error('Plumbing service not found');

        console.log(`Using Service: ${service.name} (ID: ${service._id})`);

        // 2. Pick a user
        const user = await User.findOne({ role: 'user' });
        if (!user) throw new Error('User not found');

        // 3. Mock coordinates (near Odalarevu where providers are)
        const coordinates = [81.970556, 16.4232813];

        console.log('--- ATTEMPTING ASSIGNMENT ---');
        // Simulate string ID vs ObjectId if that's the issue
        const bestProvider = await findBestProvider(
            service._id.toString(), // Simulating string from req.body
            coordinates,
            new Date(),
            "10:00"
        );

        if (bestProvider) {
            console.log(`SUCCESS: Found ${bestProvider.username}`);
        } else {
            console.log('FAILURE: No provider found');
            
            // Debug: Check if any provider has this service
            const eligible = await User.find({
                role: 'provider',
                status: 'Verified',
                servicesOffered: service._id
            });
            console.log(`Found ${eligible.length} providers with this service in DB (without location check)`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testBookingCreation();
