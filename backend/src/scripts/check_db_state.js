const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- SERVICES ---');
        const services = await Service.find();
        services.forEach(s => console.log(`ID: ${s._id}, Name: ${s.name}, Category: ${s.category}`));

        console.log('\n--- PROVIDERS ---');
        const providers = await User.find({ role: 'provider' });
        providers.forEach(p => {
            console.log(`ID: ${p._id}, Username: ${p.username}, Status: ${p.status}, Services: ${p.servicesOffered}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkData();
