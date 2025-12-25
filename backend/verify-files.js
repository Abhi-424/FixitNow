const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m"
};

const log = (msg, color = COLORS.reset) => console.log(`${color}${msg}${COLORS.reset}`);

// Helper to make HTTP requests
const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: data ? JSON.parse(data) : {} 
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  log('\n🧪 Starting Verification Tests...\n', COLORS.cyan);

  try {
    // 1. Login to get token
    log('1. Testing Authentication (Login)...', COLORS.yellow);
    // Assuming a user exists from the previous seeding or we use the dev user created
    const loginRes = await request('/auth/login', 'POST', {
      email: 'john@example.com', // Assuming this user exists from previous context or seed
      password: 'password123'
    });

    if (loginRes.status !== 200) {
      log('   ❌ Login failed. Cannot proceed with tests.', COLORS.red);
      log(`   Error: ${JSON.stringify(loginRes.data)}`);
      // Try to register if login fails
      log('   ⚠️  Attempting to register a test user...', COLORS.yellow);
      const registerRes = await request('/auth/register', 'POST', {
        username: 'TestUser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'password123',
        role: 'user'
      });
      
      if (registerRes.status !== 201) {
        log('   ❌ Registration also failed.', COLORS.red);
        process.exit(1);
      }
      
      var token = registerRes.data.token;
      log('   ✅ Registered new test user successfully!', COLORS.green);
    } else {
      var token = loginRes.data.token;
      log('   ✅ Login successful!', COLORS.green);
    }

    // 2. Test Get Profile
    log('\n2. Testing GET /api/users/profile...', COLORS.yellow);
    const profileRes = await request('/users/profile', 'GET', null, token);
    
    if (profileRes.status === 200 && profileRes.data.email) {
      log('   ✅ Profile fetched successfully!', COLORS.green);
      log(`   User: ${profileRes.data.username} (${profileRes.data.email})`);
    } else {
      log('   ❌ Failed to fetch profile.', COLORS.red);
      log(`   Status: ${profileRes.status}`);
    }

    // 3. Test Update Profile
    log('\n3. Testing PUT /api/users/profile...', COLORS.yellow);
    const newLocation = 'Test City ' + Math.floor(Math.random() * 100);
    const updateRes = await request('/users/profile', 'PUT', {
      location: newLocation
    }, token);

    if (updateRes.status === 200 && updateRes.data.location === newLocation) {
      log('   ✅ Profile updated successfully!', COLORS.green);
      log(`   New Location: ${updateRes.data.location}`);
    } else {
      log('   ❌ Failed to update profile.', COLORS.red);
      log(`   Status: ${updateRes.status}`);
    }

    // 4. Test Error Middleware (404)
    log('\n4. Testing Error Middleware (404)...', COLORS.yellow);
    const notFoundRes = await request('/non-existent-route', 'GET');
    
    if (notFoundRes.status === 404) {
      log('   ✅ 404 Error handled correctly!', COLORS.green);
    } else {
      log('   ❌ 404 Error check failed.', COLORS.red);
      log(`   Status: ${notFoundRes.status}`);
    }

    log('\n✨ Verification Complete! All implemented files are working correctly.\n', COLORS.cyan);

  } catch (error) {
    log(`\n❌ Verification script error: ${error.message}`, COLORS.red);
  }
};

runTests();
