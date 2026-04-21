#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('\n========================================');
console.log('Database User Check');
console.log('========================================\n');

const dbPath = path.join(__dirname, 'database.sqlite');
console.log(`Database path: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('✓ Connected to database\n');
  
  // Get users table info
  db.all(`SELECT id, email, firstName, lastName, role, isActive FROM users`, (err, rows) => {
    if (err) {
      if (err.message.includes('no such table')) {
        console.log('❌ Users table does not exist yet');
      } else {
        console.error('❌ Error querying users:', err.message);
      }
      db.close();
      process.exit(1);
    }
    
    if (!rows || rows.length === 0) {
      console.log('⚠️  No users found in database');
      console.log('\nYou may need to:');
      console.log('  1. Run: npm run db:seed');
      console.log('  2. Or manually create a test user');
    } else {
      console.log(`✓ Found ${rows.length} user(s):\n`);
      rows.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.isActive}`);
        console.log('');
      });
    }
    
    db.close();
    process.exit(0);
  });
});
