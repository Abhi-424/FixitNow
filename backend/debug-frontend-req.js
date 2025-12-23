const http = require('http');

const registerData = JSON.stringify({
  name: "Frontend Test User",
  email: "frontend_test@example.com",
  password: "password123",
  role: "user"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length,
    'Origin': 'http://localhost:5173' // Simulate Vite frontend origin
  }
};

console.log('Simulating frontend registration request...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(registerData);
req.end();
