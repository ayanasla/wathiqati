#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const backendDir = __dirname;
process.chdir(backendDir);

let serverProcess = null;

// Helper to make HTTP request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Wait for server to be ready
function waitForServer(maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      makeRequest('GET', '/health').then(() => {
        clearInterval(interval);
        resolve();
      }).catch(() => {
        if (Date.now() - startTime > maxWait) {
          clearInterval(interval);
          reject(new Error('Server did not respond within timeout'));
        }
      });
    }, 500);
  });
}

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('WATHIQATI BACKEND LOGIN TEST');
    console.log('='.repeat(60) + '\n');

    // Step 1: Initialize database
    console.log('STEP 1: Initializing database with demo users');
    console.log('-'.repeat(60));
    console.log('Running: node scripts/init-db.js\n');

    const initResult = spawnSync('node', ['scripts/init-db.js'], {
      stdio: 'inherit',
      cwd: backendDir
    });

    if (initResult.status !== 0) {
      console.error('\n❌ Database initialization failed');
      process.exit(1);
    }

    console.log('\n✓ Database initialized successfully');

    // Step 2: Start server
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Starting backend server');
    console.log('-'.repeat(60) + '\n');

    serverProcess = spawn('node', ['server.js'], {
      cwd: backendDir
    });

    let serverOutput = '';
    let serverStarted = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log(`[SERVER] ${output.trim()}`);
      if (output.includes('Server running on port')) {
        serverStarted = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.log(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    // Wait for server to start
    console.log('Waiting for server to be ready...');
    try {
      await waitForServer(10000);
      console.log('\n✓ Server is ready for requests\n');
    } catch (e) {
      console.error('\n❌ Server did not start in time:', e.message);
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }

    // Step 3: Test login
    console.log('='.repeat(60));
    console.log('STEP 3: Testing login endpoint');
    console.log('-'.repeat(60) + '\n');

    const loginPayload = {
      email: 'admin@yaacoub.ma',
      password: 'Admin123!'
    };

    console.log('Sending POST /api/auth/login');
    console.log(`  URL: http://localhost:5002/api/auth/login`);
    console.log(`  Payload: ${JSON.stringify(loginPayload)}\n`);

    const response = await makeRequest('POST', '/api/auth/login', loginPayload);

    console.log('✓ Response received:\n');
    console.log(`  Status Code: ${response.status}`);
    console.log(`  Status Text: ${response.statusText}`);
    console.log(`  Headers:`);
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}`);
    });
    console.log(`\n  Body:\n${response.body}\n`);

    try {
      const parsed = JSON.parse(response.body);
      console.log('Parsed Response:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('(Could not parse as JSON)');
    }

    // Step 4: Capture server logs
    console.log('\n' + '='.repeat(60));
    console.log('STEP 4: Server logs during login');
    console.log('-'.repeat(60) + '\n');
    console.log('(Server logs appear above with [SERVER] prefix)\n');

    // Summary
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('-'.repeat(60) + '\n');

    if (response.status === 200) {
      console.log('✓ Login successful!');
      console.log(`✓ Status Code: ${response.status}`);
    } else if (response.status >= 400 && response.status < 500) {
      console.log('❌ Login failed (Client error)');
      console.log(`✗ Status Code: ${response.status}`);
    } else {
      console.log('❌ Login failed (Server error)');
      console.log(`✗ Status Code: ${response.status}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Cleanup
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (serverProcess) serverProcess.kill();
    process.exit(1);
  }
}

// Handle signals
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  if (serverProcess) serverProcess.kill();
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  if (serverProcess) serverProcess.kill();
  process.exit(1);
});
