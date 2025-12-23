const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@fixitnow.com';
    const adminPassword = 'admin123';
    const adminUsername = 'Admin';

    // Check if admin already exists
    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const user = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'Active',
      location: 'Headquarters'
    });

    console.log(`Admin user created successfully: ${user.email}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
