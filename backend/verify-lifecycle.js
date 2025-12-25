const BASE_URL = 'http://localhost:5000/api';

// Helper to generate unique email
const uniqueEmail = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

const request = async (url, method, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`Sending ${method} to ${url}`);
    
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        if (!res.ok) {
            console.error('❌ Error Response:', JSON.stringify(data, null, 2));
            throw new Error(`Request failed with status ${res.status}`);
        }
        return data;
    } catch (err) {
        console.error('❌ Network/Parse Error:', err.message);
        throw err;
    }
};

const run = async () => {
    try {
        console.log('\n--- 1. Registering User ---');
        const userEmail = uniqueEmail('user_cycle');
        const userData = await request(`${BASE_URL}/auth/register`, 'POST', {
            username: `User_${Math.floor(Math.random()*1000)}`,
            email: userEmail,
            password: 'password123',
            role: 'user'
        });
        const userToken = userData.token;

        console.log('\n--- 2. Registering Provider ---');
        const provEmail = uniqueEmail('prov_cycle');
        const provData = await request(`${BASE_URL}/auth/register`, 'POST', {
            username: `Prov_${Math.floor(Math.random()*1000)}`,
            email: provEmail,
            password: 'password123',
            role: 'provider'
        });
        const provToken = provData.token;

        // Get Service id
        const services = await request(`${BASE_URL}/services`, 'GET');
        const service = services[0];
        
        console.log('\n--- 3. Create Booking (User) ---');
        let booking = await request(`${BASE_URL}/bookings`, 'POST', {
            service: service.name,
            serviceId: service._id,
            description: 'Full Lifecycle Test',
            location: '123 Main St',
            scheduledDate: new Date(),
            amount: 50
        }, userToken);
        const bookingId = booking._id;
        console.log(`✅ Booking Created [${booking.status}]`);

        console.log('\n--- 4. Accept Booking (Provider) ---');
        booking = await request(`${BASE_URL}/bookings/${bookingId}/status`, 'PATCH', { status: 'Accepted' }, provToken);
        console.log(`✅ Booking Accepted [${booking.status}] Provider: ${booking.provider}`);

        console.log('\n--- 5. Start Job (Provider) ---');
        booking = await request(`${BASE_URL}/bookings/${bookingId}/status`, 'PATCH', { status: 'In Progress' }, provToken);
        console.log(`✅ Job Started [${booking.status}]`);

        console.log('\n--- 6. Complete Job (Provider) ---');
        booking = await request(`${BASE_URL}/bookings/${bookingId}/status`, 'PATCH', { status: 'Waiting for Confirmation' }, provToken);
        console.log(`✅ Job Completed by Tech [${booking.status}]`);

        console.log('\n--- 7. Confirm Completion (User) ---');
        booking = await request(`${BASE_URL}/bookings/${bookingId}/status`, 'PATCH', { status: 'Completed' }, userToken);
        console.log(`✅ Job Confirmed by User [${booking.status}]`);
        
        console.log('\n🎉 FULL LIFECYCLE SUCCESS!');

    } catch (err) {
        console.error('\n❌ Test Failed:', err.message);
        process.exit(1);
    }
};

run();
