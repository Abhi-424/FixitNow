const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { getProviderBookings } = require('../controllers/bookingController');
const path = require('path');

// Load env vars from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('DB Connection Failed:', err.message);
    process.exit(1);
  }
};

const mockRes = () => {
  const res = {};
  res.json = (data) => {
    res.data = data;
    return res;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  return res;
};

const runTest = async () => {
  await connectDB();

  let u1, p1, p2, b1;

  try {
    console.log('Creating Test Data...');
    // Create User and Providers
    u1 = await User.create({
      username: 'testuser_vis',
      email: 'testuser_vis@example.com',
      password: 'password123',
      role: 'user',
      location: { type: 'Point', coordinates: [0, 0], address: 'Test Addr' }
    });

    p1 = await User.create({
      username: 'testprov1_vis',
      email: 'testprov1_vis@example.com',
      password: 'password123',
      role: 'provider',
      status: 'Verified',
      location: { type: 'Point', coordinates: [0, 0], address: 'Prov1 Addr' }
    });

    p2 = await User.create({
      username: 'testprov2_vis',
      email: 'testprov2_vis@example.com',
      password: 'password123',
      role: 'provider',
      status: 'Verified',
      location: { type: 'Point', coordinates: [0, 0], address: 'Prov2 Addr' }
    });

    // 1. Create Pending Unassigned Booking
    b1 = await Booking.create({
      user: u1._id,
      service: 'Test Service',
      location: { type: 'Point', coordinates: [0, 0], address: 'Booking Addr' },
      scheduledDate: new Date(),
      status: 'Pending',
      provider: null // Unassigned
    });
    console.log(`Booking Created: ${b1._id}`);

    // TEST 1: Visibility for P1 on Unassigned Pending Booking
    console.log('Test 1: Check visibility for P1 (Unassigned Booking)');
    let req = { user: { id: p1._id, role: 'provider', status: 'Verified' } };
    let res = mockRes();
    await getProviderBookings(req, res);
    
    if (res.data.length === 0) {
      console.log('PASS: P1 sees 0 bookings.');
    } else {
      console.error(`FAIL: P1 sees ${res.data.length} bookings (Expected 0).`);
    }

    // TEST 2: Assign to P1
    console.log('Test 2: Assign Booking to P1');
    b1.provider = p1._id;
    await b1.save();

    req = { user: { id: p1._id, role: 'provider', status: 'Verified' } };
    res = mockRes();
    await getProviderBookings(req, res);
    if (res.data.length === 1 && res.data[0]._id.toString() === b1._id.toString()) {
      console.log('PASS: P1 sees the assigned booking.');
    } else {
      console.error(`FAIL: P1 sees ${res.data.length} bookings.`);
    }

    // TEST 3: Check visibility for P2 (Assigned to P1)
    console.log('Test 3: Check visibility for P2 (Assigned to P1)');
    req = { user: { id: p2._id, role: 'provider', status: 'Verified' } };
    res = mockRes();
    await getProviderBookings(req, res);
    if (res.data.length === 0) {
      console.log('PASS: P2 sees 0 bookings.');
    } else {
      console.error(`FAIL: P2 sees ${res.data.length} bookings.`);
    }

    // TEST 4: Decline (Unassign)
    console.log('Test 4: P1 Declines (Simulation: provider=null)');
    b1.provider = null;
    b1.rejectedProviders.push(p1._id);
    await b1.save();

    req = { user: { id: p1._id, role: 'provider', status: 'Verified' } };
    res = mockRes();
    await getProviderBookings(req, res);
    if (res.data.length === 0) {
      console.log('PASS: P1 sees 0 bookings after decline.');
    } else {
      console.error(`FAIL: P1 sees ${res.data.length} bookings.`);
    }

  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    console.log('Cleaning up...');
    if (u1) await User.findByIdAndDelete(u1._id);
    if (p1) await User.findByIdAndDelete(p1._id);
    if (p2) await User.findByIdAndDelete(p2._id);
    if (b1) await Booking.findByIdAndDelete(b1._id);
    await mongoose.disconnect();
  }
};

runTest();
