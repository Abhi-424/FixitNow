const BASE_URL = 'http://localhost:5000/api';

// Helper to generate unique email
const uniqueEmail = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

const request = async (url, method, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`Sending ${method} to ${url}`);
    if (body) console.log('Body:', JSON.stringify(body, null, 2));

    try {
        const res = await fetch(url, options);
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        console.log('Status:', res.status);
        if (!res.ok) {
            console.error('❌ Error Response:', JSON.stringify(data, null, 2));
            return null;
        }
        return data;
    } catch (err) {
        console.error('❌ Network/Parse Error:', err.message);
        return null;
    }
};

const run = async () => {
    // 1. Register User
    console.log('\n--- 1. Registering User ---');
    const userEmail = uniqueEmail('debug_user');
    const userData = await request(`${BASE_URL}/auth/register`, 'POST', {
        username: `DebugUser_${Math.floor(Math.random() * 1000)}`,
        email: userEmail,
        password: 'password123',
        role: 'user'
    });

    if (!userData) return;
    const token = userData.token;
    console.log('✅ User registered');

    // 2. Get Services
    console.log('\n--- 2. Fetching Services ---');
    const services = await request(`${BASE_URL}/services`, 'GET');
    if (!services || services.length === 0) {
        console.error('No services found');
        return;
    }
    const service = services[0];
    console.log('✅ Service found:', service.name, service._id);

    // 3. Create Booking
    console.log('\n--- 3. Creating Booking ---');
    const bookingPayload = {
        service: service.name,
        serviceId: service._id,
        description: 'Debug booking description',
        location: 'Debug Location 123',
        scheduledDate: new Date().toISOString(),
        amount: service.basePrice || 100
    };

    const booking = await request(`${BASE_URL}/bookings`, 'POST', bookingPayload, token);
    
    if (booking) {
        console.log('✅ Booking Created Successfully!', booking._id);
    } else {
        console.log('❌ Booking Creation Failed');
    }
};

run();
