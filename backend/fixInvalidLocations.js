const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const fixLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find users with invalid location (string type)
        // MongoDB allow checking type by alias 'string' or number 2
        // We look for documents where 'location' is of type string
        const invalidUsers = await User.collection.find({ location: { $type: "string" } }).toArray();
        
        console.log(`Found ${invalidUsers.length} users with invalid location format (string).`);

        if (invalidUsers.length === 0) {
            console.log("No invalid users found via query.");
            // Double check AdminUser specifically just in case query misses
            const admin = await User.findOne({ username: "AdminUser" });
            if (admin && typeof admin.location === 'string') {
                 console.log("Found AdminUser with string location manually.");
                 invalidUsers.push(admin);
            }
        }

        for (const user of invalidUsers) {
            console.log(`Fixing user: ${user.username}, Location value: "${user.location}"`);
            
            const originalLocationString = user.location;
            
            const newLocation = {
                type: 'Point',
                coordinates: [0, 0], // Default coordinates
                address: originalLocationString // Keep the original string as address
            };

            await User.collection.updateOne(
                { _id: user._id },
                { $set: { location: newLocation } }
            );
            console.log(`Updated ${user.username} to valid GeoJSON.`);
        }
        
        console.log('Finished fixing locations. Attempts to sync indexes now...');
        
        try {
            await mongoose.connection.syncIndexes();
            console.log('✅ Indexes synced successfully!');
        } catch (idxError) {
             console.error('Index sync failed still:', idxError.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixLocations();
