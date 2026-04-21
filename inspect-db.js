const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');

console.log('\n' + '='.repeat(70));
console.log('DATABASE USER INSPECTION');
console.log('='.repeat(70) + '\n');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log(`❌ Database file not found at: ${dbPath}`);
  console.log('\nTo initialize the database, run:');
  console.log('  cd backend');
  console.log('  node scripts/init-db.js');
  process.exit(1);
}

console.log(`✓ Database found: ${dbPath}`);
const stats = fs.statSync(dbPath);
console.log(`  Last modified: ${stats.mtime}`);
console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

// Query the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(`❌ Cannot open database: ${err.message}`);
    process.exit(1);
  }

  console.log('Connected to database\n');

  // Check if users table exists
  db.all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
    (err, tables) => {
      if (err || !tables || tables.length === 0) {
        console.error('❌ Users table does not exist');
        console.error('The database needs to be initialized.');
        db.close();
        process.exit(1);
      }

      console.log('✓ Users table exists\n');

      // Get users
      db.all(
        'SELECT id, email, firstName, lastName, role, isActive, password FROM users ORDER BY createdAt DESC',
        (err, users) => {
          if (err) {
            console.error(`❌ Failed to query users: ${err.message}`);
            db.close();
            process.exit(1);
          }

          if (!users || users.length === 0) {
            console.log('⚠️  No users found in database');
            console.log('\nTo create demo users, run:');
            console.log('  cd backend');
            console.log('  node scripts/init-db.js');
            db.close();
            process.exit(0);
          }

          console.log(`✓ Found ${users.length} users:\n`);

          let adminCount = 0;
          let targetAdminFound = false;

          users.forEach((user, idx) => {
            const isAdmin = user.role === 'admin';
            if (isAdmin) adminCount++;

            console.log(`${idx + 1}. ${user.email}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive ? '✓' : '✗'}`);
            console.log(
              `   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`
            );

            if (user.email === 'admin@yaacoub.ma') {
              targetAdminFound = true;
              console.log('   >>> TARGET LOGIN ACCOUNT <<<');
            }

            console.log('');
          });

          console.log('-'.repeat(70));
          console.log(`\nSummary:`);
          console.log(`  Total users: ${users.length}`);
          console.log(`  Admin accounts: ${adminCount}`);
          console.log(
            `  admin@yaacoub.ma exists: ${targetAdminFound ? '✓ YES' : '✗ NO'}`
          );

          if (!targetAdminFound) {
            console.log('\n⚠️  admin@yaacoub.ma NOT FOUND');
            console.log('The login test will fail with "Invalid email or password"');
          } else {
            console.log('\n✓ admin@yaacoub.ma found and ready for login test');
            console.log('Expected test credentials:');
            console.log('  Email: admin@yaacoub.ma');
            console.log('  Password: Admin123!');
          }

          console.log('\n' + '='.repeat(70) + '\n');

          db.close();
          process.exit(0);
        }
      );
    }
  );
});
