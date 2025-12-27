const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');
const Service = require('./src/models/Service');

dotenv.config();

const verifyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const userCount = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'user' });
    const providerCount = await User.countDocuments({ role: 'provider' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const bookingCount = await Booking.countDocuments();
    const serviceCount = await Service.countDocuments();

    console.log('--- Database Verification ---');
    console.log(`Total Users in DB: ${userCount}`);
    console.log(`- Customers (role='user'): ${customerCount}`);
    console.log(`- Providers (role='provider'): ${providerCount}`);
    console.log(`- Admins (role='admin'): ${adminCount}`);
    console.log(`Total Bookings: ${bookingCount}`);
    console.log(`Total Services: ${serviceCount}`);

    if (userCount === 0) {
        console.log('\nWARNING: Database is empty! You need to run the seed script.');
    } else if (customerCount === 0 && providerCount === 0) {
        console.log('\nWARNING: Users exist but roles might be missing or incorrect.');
        const sampleUser = await User.findOne();
        console.log('Sample User:', sampleUser);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyData();
