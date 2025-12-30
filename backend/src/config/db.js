const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Ensure indexes are created (including geospatial index)
    console.log('Syncing database indexes...');
    await mongoose.connection.syncIndexes();
    console.log('Database indexes synced successfully');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
