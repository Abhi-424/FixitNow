const path = require('path');
const dotenvPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const mongoose = require('mongoose');
const User = require('../models/User');

const migrateAndFix = async () => {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Running migration...');
    
    // 1. Fix users with no location or string location (if any, though schema should have prevented)
    // 2. Fix users with location object but missing/empty coordinates
    
    // Update 1: Set default coordinates for existing incomplete locations
    const res1 = await User.collection.updateMany(
        { 
            $or: [
                { "location.coordinates": { $exists: false } },
                { "location.coordinates": { $size: 0 } },
                { "location.coordinates": null }
            ],
            "location.address": { $exists: true } 
        },
        { 
            $set: { 
                "location.type": "Point",
                "location.coordinates": [0, 0] // Default to 0,0
            } 
        }
    );
    console.log(`Updated ${res1.modifiedCount} users with valid address but missing coords.`);

    // Update 2: If location is present but empty? (Maybe not needed if schema defaults handled it)
    
    // Ensure all have type: Point
    await User.collection.updateMany(
        { "location": { $exists: true }, "location.type": { $exists: false } },
        { $set: { "location.type": "Point" } }
    );

    console.log('Attempting to create index...');
    try {
        await User.collection.createIndex({ location: '2dsphere' });
        console.log('Index created successfully!');
    } catch (err) {
        console.error('Index creation failed:', err.message);
        // If it failed, maybe some docs are still bad?
        // Let's print one bad doc?
        // const badDoc = await User.findOne({ "location.coordinates": { $not: { $size: 2 } } });
        // console.log('Sample bad doc:', badDoc);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

migrateAndFix();
