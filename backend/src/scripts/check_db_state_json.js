const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const services = await Service.find();
        const providers = await User.find({ role: 'provider' });

        const data = {
            services: services.map(s => ({ id: s._id, name: s.name, category: s.category })),
            providers: providers.map(p => ({
                id: p._id,
                username: p.username,
                status: p.status,
                servicesOffered: p.servicesOffered,
                location: p.location
            }))
        };

        fs.writeFileSync(path.join(__dirname, 'db_state.json'), JSON.stringify(data, null, 2));
        console.log('Data written to db_state.json');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkData();
