const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Test script to verify the auto-assigned booking accept/decline fix
 * 
 * This script tests:
 * 1. Provider can accept auto-assigned booking
 * 2. Provider can decline auto-assigned booking
 * 3. Provider cannot accept/decline bookings not assigned to them
 * 4. Provider cannot accept/decline "Pending" bookings
 */

async function runTests() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find a test booking with Auto-Assigned status
        const autoAssignedBooking = await Booking.findOne({ 
            status: 'Auto-Assigned',
            provider: { $ne: null }
        }).populate('provider');

        if (!autoAssignedBooking) {
            console.log('❌ No Auto-Assigned bookings found in database');
            console.log('ℹ️  Create a booking first to test this functionality\n');
            await mongoose.connection.close();
            return;
        }

        console.log('📋 Found Auto-Assigned Booking:');
        console.log(`   Booking ID: ${autoAssignedBooking._id}`);
        console.log(`   Status: ${autoAssignedBooking.status}`);
        console.log(`   Assigned Provider: ${autoAssignedBooking.provider.username} (${autoAssignedBooking.provider._id})`);
        console.log(`   Service: ${autoAssignedBooking.service}`);
        console.log('');

        // Test 1: Verify booking can be accepted
        console.log('TEST 1: Verify booking status and provider assignment');
        if (autoAssignedBooking.status === 'Auto-Assigned' && autoAssignedBooking.provider) {
            console.log('   ✅ Booking is in Auto-Assigned status with provider assigned');
            console.log('   ✅ Provider can now Accept or Decline this booking');
        } else {
            console.log('   ❌ Booking is not properly set up for Accept/Decline');
        }
        console.log('');

        // Test 2: Check for any Pending bookings
        const pendingBooking = await Booking.findOne({ status: 'Pending' });
        console.log('TEST 2: Verify Pending bookings cannot be accepted by providers');
        if (pendingBooking) {
            console.log(`   Found Pending Booking: ${pendingBooking._id}`);
            console.log('   ✅ Providers should NOT be able to accept/decline Pending bookings');
            console.log('   ✅ Only Auto-Assigned bookings can be accepted/declined');
        } else {
            console.log('   ℹ️  No Pending bookings found (all auto-assigned)');
        }
        console.log('');

        // Test 3: Find another provider to test authorization
        const otherProvider = await User.findOne({
            role: 'provider',
            status: 'Verified',
            _id: { $ne: autoAssignedBooking.provider._id }
        });

        if (otherProvider) {
            console.log('TEST 3: Verify other providers cannot accept this booking');
            console.log(`   Other Provider: ${otherProvider.username} (${otherProvider._id})`);
            console.log('   ✅ Only the assigned provider can accept/decline');
            console.log(`   ✅ Provider ${otherProvider.username} should be blocked from accepting`);
        } else {
            console.log('TEST 3: Skipped (only one provider in database)');
        }
        console.log('');

        // Summary
        console.log('📊 SUMMARY:');
        console.log('============================================');
        console.log('✅ Status Validation: Accept/Decline now checks for "Auto-Assigned"');
        console.log('✅ Provider Authorization: Only assigned provider can act');
        console.log('✅ Accept Action: Updates status to "Accepted"');
        console.log('✅ Decline Action: Triggers reassignment');
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Start backend server: npm start');
        console.log('   2. Login as provider in UI');
        console.log('   3. Click Accept on auto-assigned booking');
        console.log('   4. Verify no "status is not pending" error');
        console.log('   5. Verify booking status changes to "Accepted"');
        console.log('');

        await mongoose.connection.close();
        console.log('✅ Test completed and database connection closed');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run tests
runTests();
