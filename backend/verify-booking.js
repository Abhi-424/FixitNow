// Configuration
const BASE_URL = 'http://localhost:5000/api';
let userToken, providerToken;
let bookingId;
let serviceId;

// Helper to generate unique email
const uniqueEmail = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

// Helper for fetch
const request = async (url, method, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = {
        method,
        headers,
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    const data = await res.json();
    
    // Allow 400/401 to be handled by caller if needed for fallback logic, 
    // but here we just want to fail or succeed. 
    // Actually, for login fallback, we need to know if it failed.
    if (!res.ok) {
        console.error('DEBUG: Error Response Body:', JSON.stringify(data, null, 2));
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        throw error;
    }
    return data;
};

// 1. Setup User (Login or Register)
const setupUser = async () => {
    try {
        console.log('1. Setting up User...');
        // Try registering a fresh user to guarantee success
        const email = uniqueEmail('user');
        const data = await request(`${BASE_URL}/auth/register`, 'POST', {
            username: `TestUser_${Math.floor(Math.random() * 10000)}`,
            email: email,
            password: 'password123',
            role: 'user'
        });
        userToken = data.token;
        console.log(`✅ User Registered: ${email}`);
    } catch (err) {
        console.error('❌ User Setup Failed:', err.message);
        process.exit(1);
    }
};

// 2. Setup Provider (Login or Register)
const setupProvider = async () => {
    try {
        console.log('2. Setting up Provider...');
        const email = uniqueEmail('provider');
        const data = await request(`${BASE_URL}/auth/register`, 'POST', {
            username: `TestProvider_${Math.floor(Math.random() * 10000)}`,
            email: email,
            password: 'password123',
            role: 'provider'
        });
        providerToken = data.token;
        console.log(`✅ Provider Registered: ${email}`);
    } catch (err) {
        console.error('❌ Provider Setup Failed:', err.message);
        process.exit(1);
    }
};

// 3. Get Services
const getServices = async () => {
    try {
        console.log('3. Fetching Services...');
        const data = await request(`${BASE_URL}/services`, 'GET');
        if (data.length === 0) throw new Error('No services found');
        serviceId = data[0]._id;
        console.log('✅ Service Found:', data[0].name);
    } catch (err) {
        console.error('❌ Get Services Failed:', err.message);
        process.exit(1);
    }
};

// 4. Create Booking (User)
const createBooking = async () => {
    try {
        console.log('4. Creating Booking...');
        const data = await request(`${BASE_URL}/bookings`, 'POST', {
            service: 'Test Service', 
            serviceId: serviceId,
            description: 'Fix my sink (Verification Script)',
            location: '123 Test St',
            scheduledDate: new Date(),
            amount: 50
        }, userToken);
        bookingId = data._id;
        console.log('✅ Booking Created:', bookingId);
    } catch (err) {
        console.error('❌ Create Booking Failed:', err.message);
        process.exit(1);
    }
};

// 5. Check Provider Dashboard (Provider)
const checkProviderDashboard = async () => {
    try {
        console.log('5. Checking Provider Dashboard...');
        const data = await request(`${BASE_URL}/bookings/provider`, 'GET', null, providerToken);
        
        const pending = data.find(b => b._id === bookingId);
        
        if (!pending) {
            console.log('Debug: Bookings visible:', JSON.stringify(data.map(b => ({id: b._id, status: b.status})), null, 2));
            throw new Error('Booking not visible to provider in pool');
        }
        console.log('✅ Booking Visible to Provider');
    } catch (err) {
        console.error('❌ Provider Check Failed:', err.message);
        process.exit(1);
    }
};

// 6. Accept Booking (Provider)
const acceptBooking = async () => {
    try {
        console.log('6. Accepting Booking...');
        const data = await request(`${BASE_URL}/bookings/${bookingId}/status`, 'PATCH', {
            status: 'In Progress'
        }, providerToken);
        
        if (data.status !== 'In Progress') throw new Error('Status update failed');
        console.log('✅ Booking Accepted');
    } catch (err) {
        console.error('❌ Accept Booking Failed:', err.message);
        process.exit(1);
    }
};

// Run Sequence
const run = async () => {
    await setupUser();
    await setupProvider();
    await getServices();
    await createBooking();
    await checkProviderDashboard();
    await acceptBooking();
    console.log('🎉 VERIFICATION SUCCESSFUL: Full Booking Flow Working!');
};

run();
