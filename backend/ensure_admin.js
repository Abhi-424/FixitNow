const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function ensureAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('✅ Connected to MongoDB');

    const email = 'admin@fixitnow.com';
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await User.findOne({ email });
    if (admin) {
        admin.password = hashedPassword;
        admin.role = 'admin';
        admin.status = 'Active';
        await admin.save();
        console.log('✅ Admin updated');
    } else {
        await User.create({
            username: 'Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            location: 'HQ',
            status: 'Active'
        });
        console.log('✅ Admin created');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

ensureAdmin();
