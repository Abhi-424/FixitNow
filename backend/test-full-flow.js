const http = require('http');

const postRequest = (path, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(body));
    req.end();
  });
};

const runTest = async () => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';

  console.log(`Testing with email: ${email}`);

  try {
    // 1. Register
    console.log('1. Registering...');
    const regRes = await postRequest('/auth/register', { email, password, role: 'user' });
    console.log(`Register Status: ${regRes.status}`);
    if (regRes.status !== 201) {
      console.error('Registration failed:', regRes.body);
      return;
    }
    console.log('Registration successful.');

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await postRequest('/auth/login', { email, password });
    console.log(`Login Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.body);
      return;
    }
    console.log('Login successful.');
    console.log('Token received:', !!loginRes.body.token);

  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
};

runTest();
