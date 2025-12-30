const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function checkAndCreateIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get existing indexes
        const indexes = await User.collection.getIndexes();
        console.log('\nExisting indexes on User collection:');
        console.log(JSON.stringify(indexes, null, 2));

        // Check if 2dsphere index exists
        const hasGeoIndex = Object.values(indexes).some(index => 
            JSON.stringify(index).includes('2dsphere')
        );

        if (!hasGeoIndex) {
            console.log('\n⚠️  Geospatial index (2dsphere) NOT found on location field');
            console.log('Creating index...');
            
            await User.collection.createIndex({ location: '2dsphere' });
            console.log('✅ Geospatial index created successfully');
        } else {
            console.log('\n✅ Geospatial index already exists');
        }

        // Verify index was created
        const updatedIndexes = await User.collection.getIndexes();
        console.log('\nUpdated indexes:');
        console.log(JSON.stringify(updatedIndexes, null, 2));

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndCreateIndexes();
