const axios = require('axios');

async function verifyServices() {
    try {
        const response = await axios.get('http://localhost:5000/api/services');
        const services = response.data;
        
        console.log(`Total services found: ${services.length}`);
        
        const newCategories = ['Pets', 'Moving', 'Decorating', 'Event'];
        const foundCategories = new Set();
        
        services.forEach(s => {
            if (newCategories.includes(s.category)) {
                foundCategories.add(s.category);
                console.log(`Found new service: ${s.name} (${s.category})`);
            }
        });
        
        const missing = newCategories.filter(c => !foundCategories.has(c));
        
        if (missing.length === 0) {
            console.log('SUCCESS: All new categories found!');
        } else {
            console.log('FAILURE: Missing categories:', missing);
        }
        
    } catch (error) {
        console.error('Error verifying services:', error.message);
    }
}

verifyServices();
