const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { findBestProvider, reassignBooking } = require('../services/assignmentService');
require('dotenv').config();

const runVerification = async () => {
    try {
        console.log('Connecting to DB...');
        // Connect to TEST database
        await mongoose.connect('mongodb://localhost:27017/fixitnow_test');
        console.log('Connected to TEST DB.');
        
        // Ensure Indexes
        await User.collection.dropIndexes();
        await User.syncIndexes();
        console.log('Indexes synced.');

        // 1. Cleanup old test data
        await User.deleteMany({ email: /test.*@example.com/ });
        await Service.deleteMany({ name: 'Test Plumbing' });
        await Booking.deleteMany({ description: 'Test Booking verify' });

        // 2. Create Service
        const service = await Service.create({
            name: 'Test Plumbing',
            description: 'Fix leaks',
            category: 'Plumbing',
            basePrice: 50
        });
        console.log('Service Created:', service.name);

        // 3. Create Providers
        const provider1 = await User.create({
            username: 'ProviderNear',
            email: 'testp1@example.com',
            password: 'password123',
            role: 'provider',
            status: 'Verified',
            servicesOffered: [service._id],
            location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // New Delhi (Base)
            availability: [{ date: new Date().toISOString().split('T')[0], slots: ['10:00'] }],
            rating: 5
        });

        const provider2 = await User.create({
            username: 'ProviderFar',
            email: 'testp2@example.com',
            password: 'password123',
            role: 'provider',
            status: 'Verified',
            servicesOffered: [service._id],
            location: { type: 'Point', coordinates: [77.2190, 28.6139] }, // Slightly away
            availability: [{ date: new Date().toISOString().split('T')[0], slots: ['10:00'] }],
            rating: 4
        });
        
        console.log(`Providers Created: ${provider1.username}, ${provider2.username}`);

        // 4. Create User
        const user = await User.create({
            username: 'TestUser',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'user',
            location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Test Address 1' } // Same as Provider1
        });

        // 5. Test Auto-Assignment
        console.log('\n--- Testing Auto-Assignment ---');
        const bestProvider = await findBestProvider(
            service._id,
            user.location.coordinates,
            new Date(),
            "10:00"
        );
        
        console.log('Best Provider Found:', bestProvider ? bestProvider.username : 'None');
        
        if (bestProvider && bestProvider._id.toString() === provider1._id.toString()) {
            console.log('✅ SUCCESS: Nearest provider assigned.');
        } else {
            console.error('❌ FAILURE: Wrong provider assigned.');
        }

        // 6. Create Actual Booking
        const booking = await Booking.create({
            user: user._id,
            service: 'Test Plumbing',
            serviceId: service._id,
            description: 'Test Booking verify',
            location: user.location,
            scheduledDate: new Date(),
            status: 'Auto-Assigned',
            provider: provider1._id
        });

        // 7. Test Rejection & Reassignment
        console.log('\n--- Testing Rejection ---');
        // Simulate Rejection: Add P1 to rejected, call reassign
        booking.rejectedProviders.push(provider1._id);
        await booking.save();

        await reassignBooking(booking._id);

        const updatedBooking = await Booking.findById(booking._id).populate('provider');
        console.log('New Assigned Provider:', updatedBooking.provider ? updatedBooking.provider.username : 'None');

        if (updatedBooking.provider && updatedBooking.provider._id.toString() === provider2._id.toString()) {
            console.log('✅ SUCCESS: Reassigned to next best provider.');
        } else {
            console.error('❌ FAILURE: Reassignment failed.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Drop database to clean up
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
};

runVerification();
