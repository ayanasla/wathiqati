# Quick Login Test Guide

## TL;DR - Run This Now

### Option 1: Automated Test (Recommended)
```bash
cd C:\Users\pc gold\Desktop\wathiqati
node run-login-test.js
```

This script will:
1. ✓ Check database for admin user
2. ✓ Initialize database if needed  
3. ✓ Start backend server
4. ✓ Send login request
5. ✓ Display full response and logs
6. ✓ Cleanup and exit

**Expected Duration:** 5-10 seconds

---

### Option 2: Manual Step-by-Step

#### Terminal 1: Start Server
```bash
cd C:\Users\pc gold\Desktop\wathiqati\backend
npm start
```

Expected output:
```
✓ Database synced
✓ Server running on port 5002
```

#### Terminal 2: Initialize Database (if empty)
```bash
cd C:\Users\pc gold\Desktop\wathiqati\backend
node scripts/init-db.js
```

Expected output:
```
Demo Accounts:
Admin: admin@yaacoub.ma / Admin123!
User1: fatima.alaoui@email.com / Password123!
User2: mohammed.tazi@email.com / Password123!
```

#### Terminal 3: Test Login
```bash
cd C:\Users\pc gold\Desktop\wathiqati
node test-login.js
```

Or with curl:
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@yaacoub.ma\",\"password\":\"Admin123!\"}"
```

---

### Option 3: Inspect Database
```bash
cd C:\Users\pc gold\Desktop\wathiqati
node inspect-db.js
```

This will show all users in the database and their details.

---

## What to Expect - Successful Login Response

### Status
```
HTTP/1.1 200 OK
```

### Response Body
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### What Each Field Means
- **success:** Login was successful (true = ✓)
- **message:** Human-readable status message
- **user.id:** Unique user identifier (UUID)
- **user.name:** Full name of the user
- **user.email:** Email address (must match login)
- **user.role:** User role (admin/citizen/employee)
- **token:** JWT token for authenticated requests

---

## Credentials for Testing

### Admin Account (Created by init-db.js)
```
Email:    admin@yaacoub.ma
Password: Admin123!
Name:     Ahmed Bennani
Role:     admin
```

### Test User Account (Created by init-db.js)
```
Email:    fatima.alaoui@email.com
Password: Password123!
Name:     Fatima Alaoui
Role:     citizen
```

---

## Using the Token (Next Steps)

Once you have the token, use it for protected endpoints:

### Get User Profile
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5002/api/auth/profile
```

### Update Profile
```bash
curl -X PUT http://localhost:5002/api/auth/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"New Name"}'
```

### Change Password
```bash
curl -X POST http://localhost:5002/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"Admin123!","newPassword":"NewPass123!"}'
```

---

## Troubleshooting

### Problem: "Cannot find module 'sqlite3'"
**Solution:**
```bash
cd backend
npm install
```

### Problem: "Database does not have a users table"
**Solution:**
```bash
cd backend
node scripts/init-db.js
```

### Problem: "User not found" (401 error)
**Solution:**
Same as above - run the init script to create demo users.

### Problem: "Port 5002 already in use"
**Solution:**
- Change PORT in `.env`: `PORT=5003`
- Or kill the process using port 5002

### Problem: Server doesn't start
**Solution:**
```bash
# Check if all dependencies are installed
npm install

# Delete database and reinitialize
rm database.sqlite
node scripts/init-db.js
npm start
```

---

## Server Logs During Login

You'll see detailed logs in the server terminal showing the login process:

```
=== LOGIN ATTEMPT ===
Raw request body: {
  "email": "admin@yaacoub.ma",
  "password": "Admin123!"
}
Extracted email: admin@yaacoub.ma
Extracted password length: 9

Validation passed, looking for user with email: admin@yaacoub.ma
User found: {
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@yaacoub.ma",
  "role": "admin",
  "isActive": true
}
About to check password...
Password check result: true
Login successful for user: admin@yaacoub.ma
```

These logs confirm each step of the authentication process.

---

## Environment Configuration

### Current .env Settings
```
NODE_ENV=development
PORT=5002
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DB_FORCE_SYNC=false
JWT_SECRET=moroccan_admin_secret_key_change_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

### Key Settings
- **PORT:** 5002 (where server listens)
- **DB_DIALECT:** sqlite (database type)
- **DB_STORAGE:** ./database.sqlite (database file path)
- **JWT_SECRET:** Secret key for signing tokens
- **JWT_EXPIRE:** Token expiration time (7d = 7 days)

---

## API Endpoint Details

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yaacoub.ma",
  "password": "Admin123!"
}
```

### Request Validation
- **Email:** Must be valid email format
- **Password:** Must not be empty

### Response Codes
- **200 OK:** Login successful, token included
- **400 Bad Request:** Validation failed
- **401 Unauthorized:** Invalid email or password
- **403 Forbidden:** Account is deactivated
- **500 Internal Server Error:** Server error

---

## Files Created for Testing

In `C:\Users\pc gold\Desktop\wathiqati`:
- **run-login-test.js** - Automated test with database check
- **inspect-db.js** - View all users in database
- **test-login.js** - Simple login test
- **LOGIN_TEST_ANALYSIS.md** - Detailed analysis (this document is summary)

In `C:\Users\pc gold\Desktop\wathiqati\backend`:
- **test-login.js** - Another login test variant
- **run-test.js** - Full test with server control
- **check-users.js** - Database user checker

---

## Quick Checklist

Before running the test:
- [ ] Node.js is installed
- [ ] npm dependencies installed: `npm install`
- [ ] Port 5002 is available
- [ ] `backend/database.sqlite` exists or can be created

After running the test:
- [ ] Server started successfully
- [ ] Database has admin user
- [ ] Login returned HTTP 200
- [ ] Response includes JWT token
- [ ] Token is in format: `xxx.yyy.zzz` (3 parts)

---

## Success Criteria

✓ Login test is successful when:
1. Server starts with "Server running on port 5002"
2. Login request returns HTTP 200 OK
3. Response body has `"success": true`
4. Response includes a valid JWT token
5. User data is returned correctly

---

Need Help? Check:
- **LOGIN_TEST_ANALYSIS.md** - Detailed technical analysis
- **backend/controllers/authController.js** - Login logic
- **backend/routes/auth.js** - API routes
- **backend/models/user.js** - User model and password validation
