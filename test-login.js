#!/usr/bin/env node

const http = require('http');
const path = require('path');

// Start the backend server
const backendDir = path.join(__dirname, 'backend');
process.chdir(backendDir);

// Load environment variables
require('dotenv').config();

// Now start the server from server.js
const serverModule = require('./server.js');

// Wait for server to start and then run tests
setTimeout(async () => {
  console.log('\n\n========== TESTING LOGIN ENDPOINT ==========\n');
  
  const PORT = process.env.PORT || 5002;
  const loginData = JSON.stringify({
    email: "admin@yaacoub.ma",
    password: "Admin123!"
  });

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log(`Sending login request to http://localhost:${PORT}/api/auth/login`);
  console.log('Request body:', JSON.parse(loginData));
  console.log('\nWaiting for response...\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n========== RESPONSE ==========');
      console.log(`Status Code: ${res.statusCode}`);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      console.log('Response Body:');
      try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log(data);
      }
      console.log('\n========== END OF RESPONSE ==========\n');
      
      // Keep the server running for a bit to see logs
      setTimeout(() => {
        console.log('\n✓ Test complete. Server will continue running for 5 more seconds to display logs...');
        setTimeout(() => {
          process.exit(0);
        }, 5000);
      }, 1000);
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    process.exit(1);
  });

  req.write(loginData);
  req.end();
}, 3000); // Wait 3 seconds for server to start
