const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' }); // Adjust path if needed

const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address');
  process.exit(1);
}

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.role = 'provider';
    await user.save();
    console.log(`User ${email} promoted to provider`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

promoteUser();
