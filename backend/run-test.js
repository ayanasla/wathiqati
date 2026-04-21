const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const path = require('path');

// Step 1: Check database
console.log('\n========================================');
console.log('STEP 1: Checking database for users');
console.log('========================================\n');

const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to database.sqlite\n');

  db.all('SELECT id, email, firstName, lastName, role, isActive, password FROM users', (err, rows) => {
    if (err) {
      console.error('Error querying users:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`Found ${rows.length} user(s):\n`);
    rows.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
      console.log('');
    });

    db.close();

    // Step 2: Start server
    console.log('========================================');
    console.log('STEP 2: Starting backend server');
    console.log('========================================\n');

    const server = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let serverOutput = '';
    let serverStarted = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log('[SERVER]', output.trim());
      
      if (output.includes('Server running on port')) {
        serverStarted = true;
      }
    });

    server.stderr.on('data', (data) => {
      console.log('[SERVER ERROR]', data.toString().trim());
    });

    // Wait for server to start, then test login
    let waitTime = 0;
    const checkServer = setInterval(() => {
      waitTime += 200;
      
      if (serverStarted || waitTime > 10000) {
        clearInterval(checkServer);
        
        console.log('\n========================================');
        console.log('STEP 3: Testing login endpoint');
        console.log('========================================\n');
        
        testLogin(() => {
          server.kill();
          process.exit(0);
        });
      }
    }, 200);
  });
});

function testLogin(callback) {
  const loginData = JSON.stringify({
    email: 'admin@yaacoub.ma',
    password: 'Admin123!'
  });

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('Sending login request:');
  console.log(`  URL: http://${options.hostname}:${options.port}${options.path}`);
  console.log(`  Method: ${options.method}`);
  console.log(`  Body: ${loginData}\n`);

  const req = http.request(options, (res) => {
    console.log(`✓ Response received:`);
    console.log(`  Status Code: ${res.statusCode}`);
    console.log(`  Status Text: ${res.statusMessage}`);
    console.log(`  Headers:`);
    Object.entries(res.headers).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}`);
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`\nResponse Body:\n${data}\n`);

      try {
        const parsed = JSON.parse(data);
        console.log('✓ Parsed JSON response:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('✗ Could not parse JSON response');
      }

      console.log('\n========================================');
      console.log('TEST COMPLETE');
      console.log('========================================\n');

      callback();
    });
  });

  req.on('error', (error) => {
    console.error('✗ Request error:', error.message);
    console.error('Make sure the server is running on port 5002');
    callback();
  });

  req.write(loginData);
  req.end();
}
