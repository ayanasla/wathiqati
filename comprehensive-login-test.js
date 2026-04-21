#!/usr/bin/env node
/**
 * Complete Backend Login Test
 * - Checks database for admin user
 * - Starts server
 * - Tests login endpoint
 * - Captures all output
 */

const sqlite3 = require('sqlite3');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, 'backend');
const DB_PATH = path.join(BACKEND_DIR, 'database.sqlite');
const PORT = 5002;

console.log('='.repeat(70));
console.log('WATHIQATI BACKEND - COMPREHENSIVE LOGIN TEST');
console.log('='.repeat(70));

// ============================================================================
// STEP 1: Check Database for Users
// ============================================================================
console.log('\nSTEP 1: Checking Database for Users');
console.log('-'.repeat(70));

if (!fs.existsSync(DB_PATH)) {
  console.error(`\n❌ Database not found at: ${DB_PATH}`);
  console.error('Please run: npm run init-db in the backend directory');
  process.exit(1);
}

console.log(`\n✓ Database found at: ${DB_PATH}`);
console.log(`  Size: ${(fs.statSync(DB_PATH).size / 1024).toFixed(2)} KB`);

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(`\n❌ Failed to open database: ${err.message}`);
    process.exit(1);
  }

  db.all(
    'SELECT id, email, firstName, lastName, role, isActive FROM users',
    (err, rows) => {
      if (err) {
        console.error(`\n❌ Failed to query users: ${err.message}`);
        db.close();
        process.exit(1);
      }

      if (!rows || rows.length === 0) {
        console.error('\n❌ No users found in database!');
        console.error('Please initialize the database with: node scripts/init-db.js');
        db.close();
        process.exit(1);
      }

      console.log(`\n✓ Found ${rows.length} user(s) in database:\n`);

      let adminFound = false;
      rows.forEach((user, idx) => {
        console.log(`  User ${idx + 1}:`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Name: ${user.firstName} ${user.lastName}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Active: ${user.isActive ? 'Yes' : 'No'}`);
        
        if (user.email === 'admin@yaacoub.ma') {
          adminFound = true;
          console.log('    ✓ THIS IS THE ADMIN ACCOUNT WE WILL TEST');
        }
        console.log('');
      });

      if (!adminFound) {
        console.warn('\n⚠️  WARNING: admin@yaacoub.ma not found in database!');
        console.warn('The login test will fail with "Invalid email or password"');
      } else {
        console.log('✓ Admin account admin@yaacoub.ma found and ready for testing');
      }

      db.close();

      // Proceed to next step
      setTimeout(() => startServer(), 1000);
    }
  );
});

// ============================================================================
// STEP 2: Start Server
// ============================================================================
function startServer() {
  console.log('\n' + '='.repeat(70));
  console.log('STEP 2: Starting Backend Server');
  console.log('-'.repeat(70) + '\n');

  console.log('Command: cd backend && node server.js');
  console.log(`Port: ${PORT}`);
  console.log('Environment: development (from .env)\n');

  process.chdir(BACKEND_DIR);
  require('dotenv').config();

  const server = spawn('node', ['server.js']);

  let serverStarted = false;
  let serverOutput = '';

  server.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log(`[SERVER OUTPUT] ${output.trim()}`);

    if (output.includes('Server running on port')) {
      serverStarted = true;
      setTimeout(() => testLogin(server), 500);
    }
  });

  server.stderr.on('data', (data) => {
    console.log(`[SERVER ERROR] ${data.toString().trim()}`);
  });

  server.on('error', (error) => {
    console.error(`\n❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

  // Timeout if server doesn't start
  setTimeout(() => {
    if (!serverStarted) {
      console.error(
        '\n⚠️  Server did not respond with "Server running on port" message'
      );
      console.error(
        'Attempting to proceed with login test anyway...\n'
      );
      testLogin(server);
    }
  }, 8000);
}

// ============================================================================
// STEP 3: Test Login Endpoint
// ============================================================================
function testLogin(serverProcess) {
  console.log('\n' + '='.repeat(70));
  console.log('STEP 3: Testing Login Endpoint');
  console.log('-'.repeat(70) + '\n');

  const loginPayload = {
    email: 'admin@yaacoub.ma',
    password: 'Admin123!'
  };

  const loginDataStr = JSON.stringify(loginPayload);

  console.log('Request Details:');
  console.log(`  Method: POST`);
  console.log(`  URL: http://localhost:${PORT}/api/auth/login`);
  console.log(`  Content-Type: application/json`);
  console.log(`  Body:\n${JSON.stringify(loginPayload, null, 2)}\n`);

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginDataStr)
    }
  };

  const request = http.request(options, (response) => {
    let responseBody = '';

    response.on('data', (chunk) => {
      responseBody += chunk;
    });

    response.on('end', () => {
      console.log('\n' + '='.repeat(70));
      console.log('STEP 4: Login Response');
      console.log('-'.repeat(70) + '\n');

      console.log('Response Details:');
      console.log(`  Status Code: ${response.statusCode}`);
      console.log(`  Status Text: ${response.statusMessage}`);

      console.log('\nResponse Headers:');
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key !== 'content-length') { // Skip very long headers
          console.log(`  ${key}: ${value}`);
        }
      });

      console.log('\nResponse Body:');
      try {
        const parsed = JSON.parse(responseBody);
        console.log(JSON.stringify(parsed, null, 2));

        // Analyze response
        console.log('\n' + '='.repeat(70));
        console.log('STEP 5: Response Analysis');
        console.log('-'.repeat(70) + '\n');

        if (response.statusCode === 200 && parsed.success) {
          console.log('✓ LOGIN SUCCESSFUL!');
          console.log(`✓ User: ${parsed.user.name} (${parsed.user.email})`);
          console.log(`✓ Role: ${parsed.user.role}`);
          console.log(`✓ Token received: ${parsed.token ? 'Yes' : 'No'}`);
          if (parsed.token) {
            console.log(`✓ Token (first 50 chars): ${parsed.token.substring(0, 50)}...`);
          }
        } else if (response.statusCode === 401) {
          console.log('❌ LOGIN FAILED - Invalid Credentials');
          console.log(`   Error: ${parsed.message}`);
          console.log('\nPossible causes:');
          console.log('  - User admin@yaacoub.ma does not exist');
          console.log('  - Password "Admin123!" is incorrect');
          console.log('  - Database was not initialized');
        } else if (response.statusCode === 403) {
          console.log('❌ LOGIN FAILED - Account Deactivated');
          console.log(`   Error: ${parsed.message}`);
        } else if (response.statusCode === 400) {
          console.log('❌ LOGIN FAILED - Validation Error');
          console.log(`   Error: ${parsed.message}`);
          if (parsed.errors) {
            console.log('   Details:');
            parsed.errors.forEach(err => {
              console.log(`     - ${err.msg}`);
            });
          }
        } else {
          console.log(`❌ LOGIN FAILED - HTTP ${response.statusCode}`);
          console.log(`   Error: ${parsed.message}`);
        }
      } catch (parseError) {
        console.log(responseBody);
        console.log(
          `\n⚠️  Could not parse response as JSON: ${parseError.message}`
        );
      }

      // Summary
      console.log('\n' + '='.repeat(70));
      console.log('TEST SUMMARY');
      console.log('-'.repeat(70) + '\n');

      if (response.statusCode === 200) {
        console.log('✓ Login endpoint is working correctly');
      } else {
        console.log('❌ Login endpoint returned an error');
        console.log(`   Status: ${response.statusCode}`);
      }

      console.log('\nServer logs (above) show the backend\'s processing of the login attempt.');
      console.log('Check for any validation errors or password check failures.\n');

      console.log('='.repeat(70) + '\n');

      // Cleanup and exit
      console.log('Shutting down server...');
      serverProcess.kill();
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
  });

  request.on('error', (error) => {
    console.error(`\n❌ HTTP Request Error: ${error.message}`);
    console.error(
      'Make sure the server has started and is listening on port ' +
      PORT
    );
    serverProcess.kill();
    process.exit(1);
  });

  request.write(loginDataStr);
  request.end();
}
