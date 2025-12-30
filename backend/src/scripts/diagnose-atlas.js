const path = require('path');
// Script is in src/scripts, .env is in backend (root), so go up two levels
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error(`ERROR: MONGO_URI is not defined in .env`);
  console.error(`Checked path: ${envPath}`);
  process.exit(1);
}

const checkConnection = async () => {
  try {
    const conn = await mongoose.connect(uri);
    
    const result = {
        host: conn.connection.host,
        dbName: conn.connection.name,
        collections: []
    };
    
    const collections = await conn.connection.db.listCollections().toArray();
    
    if (collections.length > 0) {
        for (const col of collections) {
            const count = await conn.connection.db.collection(col.name).countDocuments();
            result.collections.push({ name: col.name, count });
        }
    }

    console.log('__JSON_START__');
    console.log(JSON.stringify(result, null, 2));
    console.log('__JSON_END__');

    if (conn.connection.name === 'test') {
        console.error('WARNING_TEST_DB: Connected to "test" database.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('CONNECTION_FAILED');
    console.error(error.message);
  }
};

checkConnection();
