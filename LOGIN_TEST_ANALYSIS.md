# Wathiqati Backend - Login Test Analysis

## Overview
This document provides a comprehensive analysis of the backend login endpoint test for the Wathiqati administrative document management system.

---

## Test Scenario

### Objective
Test the login endpoint at `POST http://localhost:5002/api/auth/login` with:
- **Email:** `admin@yaacoub.ma`
- **Password:** `Admin123!`

### Environment
- **Backend Directory:** `C:\Users\pc gold\Desktop\wathiqati\backend`
- **Port:** 5002 (configured in `.env`)
- **Database:** SQLite (`./database.sqlite`)
- **Node.js:** Required

---

## Step-by-Step Breakdown

### Step 1: Database Verification

#### Location
`C:\Users\pc gold\Desktop\wathiqati\backend\database.sqlite`

#### What to Check
The database should contain a users table with at least one admin account:

```
Email: admin@yaacoub.ma
Name: Ahmed Bennani
Role: admin
Active: Yes (isActive = 1)
Password: (bcrypt hashed)
```

#### Expected Output
```
✓ Users table exists
✓ Found X users:

  1. admin@yaacoub.ma
     Name: Ahmed Bennani | Role: admin | Active: Yes
     >>> TARGET LOGIN ACCOUNT <<<

  2. fatima.alaoui@email.com
     Name: Fatima Alaoui | Role: citizen | Active: Yes

  3. mohammed.tazi@email.com
     Name: Mohammed Tazi | Role: citizen | Active: Yes
```

#### Potential Issues
- **No users table:** Database hasn't been initialized
  - **Solution:** Run `node scripts/init-db.js`
- **No admin user:** Database exists but wasn't seeded
  - **Solution:** Run `node scripts/init-db.js` to initialize with demo users

---

### Step 2: Server Startup

#### Command
```bash
cd C:\Users\pc gold\Desktop\wathiqati\backend
node server.js
```

#### Configuration
- **Port:** 5002 (from `.env`: `PORT=5002`)
- **Dialect:** sqlite (from `.env`: `DB_DIALECT=sqlite`)
- **Storage:** `./database.sqlite`
- **JWT Secret:** `moroccan_admin_secret_key_change_in_production`
- **Database Sync:** Non-destructive (force: false, alter: true)

#### Expected Output
```
✓ Database synced
✓ Server running on port 5002
✓ Health check: http://localhost:5002/health
```

#### Startup Steps (from `server.js`)
1. Load environment variables from `.env`
2. Set up Express app with CORS, JSON middleware
3. Connect to SQLite database
4. Sync Sequelize models with database
5. Start listening on port 5002

#### Timeline
- Database sync: ~1-2 seconds
- Total startup: ~2-3 seconds

---

### Step 3: Login Request

#### HTTP Request Details
```
POST /api/auth/login HTTP/1.1
Host: localhost:5002
Content-Type: application/json
Content-Length: 56

{
  "email": "admin@yaacoub.ma",
  "password": "Admin123!"
}
```

#### Request Validation (from `authController.js:loginValidation`)
The request body is validated before processing:

```javascript
body('email')
  .isEmail()
  .normalizeEmail()
  // Valid: ✓ (is a valid email)

body('password')
  .notEmpty()
  // Valid: ✓ (not empty)
```

#### Expected Validation Result
✓ Passes validation - both email and password are present and valid

---

### Step 4: Login Processing

#### Route Handler
File: `routes/auth.js`
```javascript
router.post('/login', loginValidation, login);
```

#### Processing Flow (from `controllers/authController.js:login`)

**1. Validation Check**
```javascript
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ ... });
}
```
Expected: ✓ No errors

**2. Extract Credentials**
```javascript
const { email, password } = req.body;
// email: 'admin@yaacoub.ma'
// password: 'Admin123!'
```

**3. Find User in Database**
```javascript
const user = await User.findOne({ where: { email } });
```

**Expected Database Query Result:**
```
SELECT * FROM users WHERE email = 'admin@yaacoub.ma'
Result: Found - Ahmed Bennani (ID: uuid, Role: admin)
```

**Server Log Output:**
```
=== LOGIN ATTEMPT ===
Raw request body: {
  "email": "admin@yaacoub.ma",
  "password": "Admin123!"
}
Request headers: {
  'content-type': 'application/json',
  'user-agent': '...'
}
Extracted email: admin@yaacoub.ma
Extracted password length: 9
Password value (first 3 chars): Admin...

Validation passed, looking for user with email: admin@yaacoub.ma
User found: {
  "id": "uuid-value",
  "email": "admin@yaacoub.ma",
  "role": "admin",
  "isActive": true,
  "passwordHashLength": 60,
  "passwordStartsWith": "$2b$",
  "name": "Ahmed Bennani"
}
```

**4. Verify Password**
```javascript
const passwordValid = user.checkPassword(password);
// Uses bcryptjs.compareSync(password, user.password)
```

**Expected Result:** ✓ True (password matches)

**Server Log Output:**
```
About to check password...
Password check result: true
Direct bcrypt compare result: true
```

**5. Check Account Status**
```javascript
if (!user.isActive) {
  return res.status(403).json({ ... });
}
```

**Expected:** ✓ User is active

**6. Generate JWT Token**
```javascript
const token = generateToken(user);
// jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
```

**Server Log Output:**
```
Login successful for user: admin@yaacoub.ma
```

---

### Step 5: Login Response

#### Successful Login Response (HTTP 200)

**Status Code:** `200 OK`

**Headers:**
```
Content-Type: application/json
Content-Length: [variable]
Date: [current date/time]
...
```

**Body:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ahmed Bennani",
    "email": "admin@yaacoub.ma",
    "role": "admin",
    "department": null,
    "phone": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiYWRtaW5AeWFhY291Yi5tYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjAzNzI0MCwiZXhwIjoxNzE2NjQyMDQwfQ...."
}
```

#### Token Details
- **Algorithm:** HS256 (HMAC-SHA256)
- **Secret:** `moroccan_admin_secret_key_change_in_production`
- **Expires:** 7 days from issue time
- **Claims:** `{ id, email, role, iat, exp }`

#### Decoded Token Example
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@yaacoub.ma",
  "role": "admin",
  "iat": 1716037240,
  "exp": 1716642040
}
```

---

## Potential Error Scenarios

### Error 1: User Not Found (401)
**Condition:** `admin@yaacoub.ma` does not exist in database

**Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Code:** 401 Unauthorized

**Server Log:**
```
User not found for email: admin@yaacoub.ma
```

**Solution:** Run `node scripts/init-db.js` to create demo users

---

### Error 2: Invalid Password (401)
**Condition:** User exists but password doesn't match

**Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Code:** 401 Unauthorized

**Server Log:**
```
User found: { ... }
About to check password...
Password check result: false
Password validation failed for user: admin@yaacoub.ma
```

**Note:** Password check uses bcrypt comparison. The hashed password starts with `$2b$` or `$2a$` (bcrypt format).

---

### Error 3: Account Deactivated (403)
**Condition:** User exists but `isActive = false`

**Response:**
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

**Status Code:** 403 Forbidden

**Server Log:**
```
User found: { ..., isActive: false }
User account deactivated: admin@yaacoub.ma
```

---

### Error 4: Validation Error (400)
**Condition:** Invalid email or missing password

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**Status Code:** 400 Bad Request

---

### Error 5: Server Error (500)
**Condition:** Unexpected error during login process

**Response:**
```json
{
  "success": false,
  "message": "Server error during login"
}
```

**Status Code:** 500 Internal Server Error

**Server Log:**
```
Login error: [error details]
```

---

## Testing Checklist

### Prerequisites
- [ ] Node.js installed
- [ ] Backend directory: `C:\Users\pc gold\Desktop\wathiqati\backend`
- [ ] `.env` file configured with `PORT=5002`
- [ ] `database.sqlite` exists and is readable
- [ ] Port 5002 is available (not in use)

### Database Setup
- [ ] Database exists at `backend/database.sqlite`
- [ ] Users table created
- [ ] Admin user `admin@yaacoub.ma` exists
- [ ] Admin password is `Admin123!` (will be bcrypt hashed)

### Server Startup
- [ ] Execute `npm start` in backend directory
- [ ] Wait for "Server running on port 5002" message
- [ ] Health check passes: `curl http://localhost:5002/health`

### Login Test
- [ ] Send POST request to `/api/auth/login`
- [ ] Include valid JSON body with email and password
- [ ] Receive 200 OK response
- [ ] Response includes JWT token
- [ ] Token can be used for authenticated requests

### Verification
- [ ] Status code is 200
- [ ] `success` field is `true`
- [ ] `token` field is present
- [ ] Token is a valid JWT (3 dot-separated parts)
- [ ] User data returned correctly

---

## Testing Commands

### Option 1: Using Pre-built Test Script
```bash
cd C:\Users\pc gold\Desktop\wathiqati
node run-login-test.js
```

### Option 2: Manual Testing with cURL
```bash
# Start server
cd C:\Users\pc gold\Desktop\wathiqati\backend
npm start

# In another terminal, test login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yaacoub.ma","password":"Admin123!"}'
```

### Option 3: Using Node.js HTTP Module
```bash
node test-login.js
```

---

## Files Involved

### Authentication Flow
1. **Routes:** `backend/routes/auth.js`
   - Defines POST `/api/auth/login` endpoint

2. **Controller:** `backend/controllers/authController.js`
   - Contains `login` function
   - Validates credentials
   - Generates JWT tokens

3. **Models:** `backend/models/user.js`
   - Defines User model
   - Contains `checkPassword` method (bcrypt comparison)

4. **Config:** `backend/config/database.js`
   - Database configuration
   - Sequelize setup

5. **Environment:** `backend/.env`
   - Port configuration
   - Database settings
   - JWT secret

### Database
- **File:** `backend/database.sqlite`
- **Table:** `users`
- **Columns:** id, firstName, lastName, email, password, role, isActive, createdAt, updatedAt

---

## Security Notes

### Password Hashing
- Passwords are hashed using bcryptjs with 10 salt rounds
- Hash format: bcrypt ($2a$ or $2b$ prefix)
- Password comparison is constant-time (bcryptjs.compareSync)

### JWT Tokens
- Secret: `moroccan_admin_secret_key_change_in_production`
- ⚠️ **Warning:** This secret should be changed in production
- Expiration: 7 days
- Algorithm: HS256

### Protected Routes
Once logged in, use the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Expected Success Scenario Summary

```
1. Database Check
   ✓ Database found: database.sqlite
   ✓ Users table exists
   ✓ admin@yaacoub.ma found with role: admin, isActive: true

2. Server Startup
   ✓ Started: node server.js
   ✓ Database synced
   ✓ Listening on port 5002

3. Login Request
   POST /api/auth/login
   Body: {"email":"admin@yaacoub.ma","password":"Admin123!"}

4. Server Processing
   ✓ Validation passed
   ✓ User found in database
   ✓ Password verified (bcrypt comparison successful)
   ✓ Account active
   ✓ JWT token generated

5. Response Received
   Status: 200 OK
   Body:
   {
     "success": true,
     "message": "Login successful",
     "user": { id, name, email, role, ... },
     "token": "eyJ..." (JWT token)
   }

6. Verification
   ✓ Token is valid JWT
   ✓ Can be used for authenticated requests
   ✓ Contains claims: id, email, role, iat, exp
```

---

## Troubleshooting

### Issue: Connection refused on port 5002
- **Cause:** Server not started or already stopped
- **Solution:** Ensure server is running with `npm start`

### Issue: User not found (401 error)
- **Cause:** Database not initialized with demo users
- **Solution:** Run `node scripts/init-db.js` in backend directory

### Issue: Invalid password (401 error)
- **Cause:** Password doesn't match database hash
- **Solution:** Verify correct password: `Admin123!`

### Issue: Account deactivated (403 error)
- **Cause:** User exists but `isActive = false`
- **Solution:** Update user in database: `UPDATE users SET isActive = 1 WHERE email = 'admin@yaacoub.ma'`

### Issue: Database lock error
- **Cause:** Database in use by another process
- **Solution:** Close other database connections or restart

### Issue: Port 5002 already in use
- **Cause:** Another process using port 5002
- **Solution:** Change PORT in `.env` or kill existing process

---

## Next Steps After Successful Login

### 1. Store Token
```javascript
const token = response.token;
localStorage.setItem('authToken', token);
```

### 2. Use Token for Protected Requests
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 3. Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### 4. Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Body: { firstName, lastName, phone, address, ... }
```

---

## Conclusion

The login endpoint is designed to:
1. Validate user credentials
2. Verify password against bcrypt hash
3. Check account status
4. Generate JWT token for future authenticated requests
5. Return user information along with token

Success is indicated by HTTP 200 status with a valid JWT token in the response.
