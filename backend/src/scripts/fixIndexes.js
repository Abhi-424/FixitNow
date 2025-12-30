const path = require('path');
const dotenvPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', dotenvPath);
const result = require('dotenv').config({ path: dotenvPath });
if (result.error) {
  console.error('Error loading .env:', result.error);
}
console.log('MONGO_URI present:', !!process.env.MONGO_URI);

const mongoose = require('mongoose');
const User = require('../models/User');

const fixIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Ensuring Request/User Location Index...');
    
    // Check existing indexes
    const indexes = await User.collection.indexes();
    console.log('Existing indexes:', indexes);

    // Create the index explicitly
    await User.collection.createIndex({ location: '2dsphere' });
    
    console.log('Index creation command sent.');
    
    const newIndexes = await User.collection.indexes();
    console.log('Updated indexes:', newIndexes);

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
