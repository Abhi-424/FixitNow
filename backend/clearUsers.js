const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Drop the users collection
    const db = mongoose.connection.db;
    
    try {
      await db.collection('users').drop();
      console.log('✅ Users collection dropped successfully');
      console.log('ℹ️  All existing users have been removed');
      console.log('ℹ️  You can now register new users with username field');
    } catch (error) {
      if (error.message === 'ns not found') {
        console.log('ℹ️  Users collection does not exist yet');
      } else {
        console.error('❌ Error dropping collection:', error);
      }
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
