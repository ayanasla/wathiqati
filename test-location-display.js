/**
 * Test: Location Display After Document Generation
 * 
 * This test verifies that:
 * 1. When a request status changes to 'document_generated', the location is still displayed
 * 2. The /requests/{id}/location endpoint returns location data with status info
 * 3. The /requests/{id}/document endpoint includes preparationLocation and documentGenerated flags
 * 4. The /requests/{id} endpoint includes preparationLocation field
 */

const http = require('http');
const BASE_URL = 'http://localhost:5002';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.token}`,
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  log('\n=== Location Display After Document Generation Test ===\n', 'blue');

  try {
    // Step 1: Login
    log('Step 1: Logging in...', 'yellow');
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@yaacoub.ma',
        password: 'Admin123!'
      }
    });

    if (loginRes.status !== 200) {
      log(`❌ Login failed: ${loginRes.status}`, 'red');
      return;
    }

    const token = loginRes.data?.token;
    if (!token) {
      log('❌ No token received from login', 'red');
      return;
    }

    log('✅ Logged in successfully', 'green');

    // Step 2: Get a list of requests
    log('\nStep 2: Getting list of requests...', 'yellow');
    const listRes = await makeRequest('/api/requests', { token });

    if (listRes.status !== 200) {
      log(`❌ Failed to get requests: ${listRes.status}`, 'red');
      return;
    }

    // Find a document_generated or approved request
    const requests = listRes.data;
    if (!Array.isArray(requests) || requests.length === 0) {
      log('❌ No requests found', 'red');
      return;
    }

    let targetRequest = requests.find(r => r.status === 'document_generated');
    if (!targetRequest) {
      targetRequest = requests.find(r => r.status === 'approved');
    }
    if (!targetRequest) {
      targetRequest = requests[0];
    }

    const requestId = targetRequest.id;
    log(`✅ Using request: ${requestId} (status: ${targetRequest.status})`, 'green');

    // Step 3: Test /requests/{id} endpoint
    log('\nStep 3: Testing GET /requests/{id} endpoint...', 'yellow');
    const getRes = await makeRequest(`/api/requests/${requestId}`, { token });

    if (getRes.status !== 200) {
      log(`❌ Failed to get request: ${getRes.status}`, 'red');
      return;
    }

    const request = getRes.data;
    log(`✅ Request retrieved successfully`, 'green');
    log(`   - Status: ${request.status}`, 'blue');
    log(`   - preparationLocation: ${request.preparationLocation || 'NOT SET'}`, 'blue');

    if (!request.preparationLocation) {
      log('   ⚠️  Warning: preparationLocation is not set in main request object', 'yellow');
    }

    // Step 4: Test /requests/{id}/location endpoint
    log('\nStep 4: Testing GET /requests/{id}/location endpoint...', 'yellow');
    const locRes = await makeRequest(`/api/requests/${requestId}/location`, { token });

    if (locRes.status !== 200) {
      log(`❌ Failed to get location: ${locRes.status}`, 'red');
      return;
    }

    const location = locRes.data;
    log(`✅ Location retrieved successfully`, 'green');
    log(`   - preparationLocation: ${location.preparationLocation}`, 'blue');
    log(`   - documentGenerated: ${location.documentGenerated}`, 'blue');
    log(`   - status: ${location.status}`, 'blue');

    if (!location.preparationLocation) {
      log('   ❌ Error: preparationLocation is missing from location endpoint', 'red');
    }

    // Step 5: Test /requests/{id}/document endpoint
    log('\nStep 5: Testing GET /requests/{id}/document endpoint...', 'yellow');
    const docRes = await makeRequest(`/api/requests/${requestId}/document`, { token });

    if (docRes.status !== 200) {
      log(`❌ Failed to get document: ${docRes.status}`, 'red');
      return;
    }

    const docInfo = docRes.data;
    log(`✅ Document info retrieved successfully`, 'green');
    log(`   - preparationLocation: ${docInfo.preparationLocation}`, 'blue');
    log(`   - documentGenerated: ${docInfo.documentGenerated}`, 'blue');
    log(`   - documentPDF: ${docInfo.documentPDF ? 'Present' : 'Not ready'}`, 'blue');

    if (!docInfo.preparationLocation) {
      log('   ❌ Error: preparationLocation is missing from document endpoint', 'red');
    }

    // Step 6: Verify consistency
    log('\nStep 6: Verification...', 'yellow');
    const mainLocation = request.preparationLocation;
    const apiLocation = location.preparationLocation;
    const docLocation = docInfo.preparationLocation;

    let allMatch = true;

    if (mainLocation !== apiLocation || mainLocation !== docLocation) {
      log('❌ Location data is inconsistent across endpoints:', 'red');
      log(`   - Main request: ${mainLocation}`, 'blue');
      log(`   - Location endpoint: ${apiLocation}`, 'blue');
      log(`   - Document endpoint: ${docLocation}`, 'blue');
      allMatch = false;
    } else {
      log('✅ Location data is consistent across all endpoints', 'green');
      log(`   - All return: ${mainLocation}`, 'blue');
    }

    if (request.status === 'document_generated') {
      if (location.documentGenerated && docInfo.documentGenerated) {
        log('✅ documentGenerated flag is properly set', 'green');
      } else {
        log('⚠️  documentGenerated flag inconsistency detected', 'yellow');
        log(`   - location endpoint: ${location.documentGenerated}`, 'blue');
        log(`   - document endpoint: ${docInfo.documentGenerated}`, 'blue');
      }
    }

    // Final summary
    log('\n=== Test Summary ===', 'blue');
    if (allMatch && mainLocation) {
      log('✅ All tests passed! Location display should work correctly.', 'green');
    } else {
      log('❌ Some tests failed. See details above.', 'red');
    }

  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run tests
runTests().catch(console.error);
