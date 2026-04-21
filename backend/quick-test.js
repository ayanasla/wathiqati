#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');

// Change to backend directory
process.chdir(path.join(__dirname));

// Step 1: Check database using simple Node.js sqlite3 query
console.log('\n' + '='.repeat(50));
console.log('STEP 1: Checking database for users');
console.log('='.repeat(50) + '\n');

try {
  const sqlite3 = require('sqlite3');
  const db = new sqlite3.Database('./database.sqlite');
  
  db.serialize(() => {
    db.all('SELECT id, email, firstName, lastName, role, isActive FROM users', (err, rows) => {
      if (err) {
        console.error('Error querying users:', err.message);
        process.exit(1);
      }
      
      console.log(`Found ${rows.length} user(s):\n`);
      rows.forEach(user => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.isActive}`);
        console.log('');
      });
      
      db.close();
      
      // Now run next step
      nextStep();
    });
  });
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

function nextStep() {
  // Step 2 & 3: Start server and test in background process
  console.log('='.repeat(50));
  console.log('STEP 2: Starting backend server');
  console.log('='.repeat(50) + '\n');
  
  // Use spawnSync with detach doesn't work well, so use npm start differently
  const result = spawnSync('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'pipe',
    timeout: 15000  // 15 second timeout
  });
  
  console.log(result.stdout.toString());
  if (result.stderr) {
    console.error(result.stderr.toString());
  }
}
