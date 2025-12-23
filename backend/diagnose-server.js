const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');

console.log('--- DIAGNOSTIC START ---');

// 1. Test Env Loading
const envPath = path.resolve(__dirname, 'src', '../.env'); // Mimic server.js logic relative to root if run from root?
// Wait, server.js is in src/. So path.resolve(__dirname, '../.env') inside src/server.js means ../ relative to src/ which is root.
// If I run this script from backend/ root, I should use .env directly or mimic the path.
// Let's mimic exactly what server.js does but adapted for running from backend/ root.

const serverJsEnvPath = path.resolve(__dirname, 'src', '../.env'); 
// __dirname is backend/. src is backend/src. .. is backend/. .env is backend/.env.
// So path.resolve('backend', 'src', '../.env') -> backend/.env. Correct.

console.log(`CWD: ${process.cwd()}`);
console.log(`Loading .env from: ${serverJsEnvPath}`);
const envConfig = dotenv.config({ path: serverJsEnvPath });

if (envConfig.error) {
  console.error('Error loading .env:', envConfig.error);
} else {
  console.log('.env loaded successfully.');
  console.log('Parsed Env:', envConfig.parsed);
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log(`PORT: ${PORT}`);
console.log(`MONGO_URI: ${MONGO_URI ? 'Defined' : 'Undefined'}`);

if (!MONGO_URI) {
  console.error('CRITICAL: MONGO_URI is missing!');
  process.exit(1);
}

// 2. Test Port Binding
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});

server.on('error', (err) => {
  console.error(`Error binding to port ${PORT}:`, err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another server might be running.`);
  }
});

server.listen(PORT, () => {
  console.log(`Successfully bound to port ${PORT}. Closing...`);
  server.close();
  
  // 3. Test Mongo Connection
  console.log('Testing MongoDB connection...');
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connection successful.');
      console.log('--- DIAGNOSTIC PASS ---');
      process.exit(0);
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      console.log('--- DIAGNOSTIC FAIL ---');
      process.exit(1);
    });
});
