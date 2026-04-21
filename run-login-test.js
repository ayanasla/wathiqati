#!/usr/bin/env node
/**
 * Wathiqati Backend - Complete Login Test Suite
 * 
 * This script will:
 * 1. Check the database for the admin user
 * 2. Start the backend server
 * 3. Send a login request
 * 4. Capture and display the full response and server logs
 */

const sqlite3 = require('sqlite3').verbose();
const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, 'backend');
const DB_PATH = path.join(BACKEND_DIR, 'database.sqlite');

// ============================================================================
// CONFIGURATION
// ============================================================================
const config = {
  email: 'admin@yaacoub.ma',
  password: 'Admin123!',
  port: 5002,
  host: 'localhost'
};

// ============================================================================
// TEST EXECUTION
// ============================================================================
async function runTest() {
  console.clear();
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('WATHIQATI BACKEND - COMPLETE LOGIN TEST');
  console.log('═'.repeat(80));

  // Step 1: Check database
  const dbCheck = await checkDatabase();
  if (!dbCheck) return;

  // Step 2: Initialize database if needed
  const dbInit = await initializeDatabaseIfNeeded();
  if (!dbInit) return;

  // Step 3: Re-check database after init
  const dbRecheck = await checkDatabase();
  if (!dbRecheck) return;

  // Step 4: Start server and test
  await startServerAndTest();
}

// ============================================================================
// STEP 1: Check Database
// ============================================================================
function checkDatabase() {
  return new Promise((resolve) => {
    console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 1: Database Check                                                      │');
    console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

    if (!fs.existsSync(DB_PATH)) {
      console.log(`✗ Database not found: ${DB_PATH}`);
      console.log('\n  Database needs to be initialized.');
      resolve(false);
      return;
    }

    console.log(`✓ Database found: database.sqlite`);
    const stats = fs.statSync(DB_PATH);
    console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Modified: ${stats.mtime.toLocaleString()}\n`);

    // Query users
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`✗ Cannot open database: ${err.message}`);
        resolve(false);
        return;
      }

      db.all(
        'SELECT id, email, firstName, lastName, role, isActive FROM users ORDER BY createdAt DESC',
        (err, users) => {
          if (err) {
            console.error(`✗ Cannot query users: ${err.message}`);
            db.close();
            resolve(false);
            return;
          }

          if (!users || users.length === 0) {
            console.log('⚠ No users in database\n');
            resolve(false);
            db.close();
            return;
          }

          console.log(`✓ Found ${users.length} users:\n`);

          let adminFound = false;
          users.forEach((user, idx) => {
            const marker =
              user.email === config.email
                ? ' ← TEST ACCOUNT'
                : '';
            console.log(`  ${idx + 1}. ${user.email}${marker}`);
            console.log(
              `     Name: ${user.firstName} ${user.lastName} | Role: ${user.role} | Active: ${user.isActive ? 'Yes' : 'No'}`
            );

            if (user.email === config.email) {
              adminFound = true;
            }
          });

          console.log('');
          if (!adminFound) {
            console.log(
              `⚠ admin@yaacoub.ma not found - login test will fail\n`
            );
          } else {
            console.log(`✓ Target account ${config.email} found\n`);
          }

          db.close();
          resolve(adminFound);
        }
      );
    });
  });
}

// ============================================================================
// STEP 2: Initialize Database If Needed
// ============================================================================
function initializeDatabaseIfNeeded() {
  return new Promise((resolve) => {
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 2: Initialize Database (if needed)                                     │');
    console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

    // Check if admin user exists
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.log('Using existing database\n');
        resolve(true);
        return;
      }

      db.get(
        `SELECT id FROM users WHERE email = ?`,
        [config.email],
        (err, user) => {
          if (user) {
            console.log(`✓ Admin user ${config.email} already exists\n`);
            db.close();
            resolve(true);
            return;
          }

          console.log(`⚠ Admin user not found, initializing database...\n`);
          db.close();

          // Run init script
          exec('node scripts/init-db.js', { cwd: BACKEND_DIR }, (error, stdout, stderr) => {
            if (error) {
              console.error(`✗ Initialization failed: ${error.message}`);
              console.error(stderr);
              resolve(false);
              return;
            }

            console.log('Init script output:');
            stdout
              .split('\n')
              .filter((l) => l.trim())
              .forEach((line) => {
                console.log(`  ${line}`);
              });
            console.log('');

            resolve(true);
          });
        }
      );
    });
  });
}

// ============================================================================
// STEP 3 & 4: Start Server and Test Login
// ============================================================================
function startServerAndTest() {
  return new Promise((resolve) => {
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 3: Starting Backend Server                                             │');
    console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

    process.chdir(BACKEND_DIR);
    require('dotenv').config();

    const server = spawn('node', ['server.js']);

    let serverStarted = false;
    const startTime = Date.now();
    const maxWait = 15000; // 15 seconds

    // Capture server output
    server.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`[SERVER] ${output}`);

      if (output.includes('Server running on port')) {
        serverStarted = true;
      }
    });

    server.stderr.on('data', (data) => {
      console.log(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    server.on('error', (error) => {
      console.error(`✗ Failed to start server: ${error.message}`);
      resolve();
      return;
    });

    // Check if server started and test
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (serverStarted) {
        clearInterval(checkInterval);
        console.log(`\n✓ Server ready after ${elapsed}ms\n`);
        setTimeout(() => testLogin(server, resolve), 500);
      } else if (elapsed > maxWait) {
        clearInterval(checkInterval);
        console.warn(
          `\n⚠ Server did not respond in ${maxWait}ms, attempting test anyway...\n`
        );
        testLogin(server, resolve);
      }
    }, 100);
  });
}

// ============================================================================
// Test Login Endpoint
// ============================================================================
function testLogin(serverProcess, callback) {
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ STEP 4: Testing Login Endpoint                                              │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

  const loginPayload = JSON.stringify({
    email: config.email,
    password: config.password
  });

  const options = {
    hostname: config.host,
    port: config.port,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  };

  console.log('Request:');
  console.log(`  POST http://${config.host}:${config.port}/api/auth/login`);
  console.log(`  Content-Type: application/json\n`);
  console.log('Payload:');
  console.log(`  ${JSON.stringify(JSON.parse(loginPayload), null, 4).split('\n').join('\n  ')}\n`);

  const startTime = Date.now();

  const request = http.request(options, (response) => {
    let responseBody = '';

    response.on('data', (chunk) => {
      responseBody += chunk;
    });

    response.on('end', () => {
      const elapsed = Date.now() - startTime;

      console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
      console.log('│ STEP 5: Login Response                                                      │');
      console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

      console.log(`Response time: ${elapsed}ms\n`);
      console.log(`Status: ${response.statusCode} ${response.statusMessage}`);
      console.log('\nHeaders:');
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'set-cookie') {
          console.log(`  ${key}: ${value}`);
        }
      });

      console.log('\nBody:');
      try {
        const parsed = JSON.parse(responseBody);
        const formatted = JSON.stringify(parsed, null, 2);
        console.log(formatted.split('\n').map((l) => `  ${l}`).join('\n'));
      } catch {
        console.log(`  ${responseBody}`);
      }

      // Analysis
      console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
      console.log('│ STEP 6: Analysis                                                            │');
      console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');

      let success = false;

      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(responseBody);
          if (data.success) {
            console.log('✓ LOGIN SUCCESSFUL\n');
            console.log(`  User: ${data.user.name}`);
            console.log(`  Email: ${data.user.email}`);
            console.log(`  Role: ${data.user.role}`);
            console.log(`  Token: ${data.token ? 'Present' : 'Missing'}`);
            success = true;
          }
        } catch (e) {
          // Continue to default error handling
        }
      }

      if (!success) {
        console.log('✗ LOGIN FAILED\n');
        try {
          const data = JSON.parse(responseBody);
          console.log(`  Error: ${data.message}`);
          if (data.errors) {
            console.log('  Details:');
            data.errors.forEach((err) => {
              console.log(`    - ${err.msg}`);
            });
          }
        } catch {
          console.log(`  Status: ${response.statusCode}`);
        }
      }

      console.log('\n' + '═'.repeat(80) + '\n');

      // Cleanup
      serverProcess.kill();
      setTimeout(() => {
        callback();
      }, 500);
    });
  });

  request.on('error', (error) => {
    console.error(
      `✗ Request failed: ${error.message}\n`
    );
    console.error(`Make sure server is running on port ${config.port}\n`);
    serverProcess.kill();
    setTimeout(() => {
      callback();
    }, 500);
  });

  request.write(loginPayload);
  request.end();
}

// ============================================================================
// Run Tests
// ============================================================================
runTest().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\nTest interrupted');
  process.exit(0);
});
