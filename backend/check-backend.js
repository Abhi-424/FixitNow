const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login', // This should return 400 if reachable (Method Not Allowed for GET, or 400 for POST without body)
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Pinging backend at http://localhost:5000/api/auth/login...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Send empty body to trigger validation error (400)
req.write(JSON.stringify({}));
req.end();
