const mongoose = require('mongoose');
const Service = require('./src/models/Service');
require('dotenv').config();

const checkServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const services = await Service.find({});
    console.log('Current Services:', JSON.stringify(services, null, 2));

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkServices();
