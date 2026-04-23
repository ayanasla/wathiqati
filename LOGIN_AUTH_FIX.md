# Login Authentication Fix - "Invalid email or password" Error

## Problem Diagnosis

Your login was failing with "Invalid email or password" because:

1. ❌ **Test users weren't created properly** - The `init-db.js` script used wrong field names (`name` instead of `firstName`/`lastName`)
2. ❌ **Password hashing wasn't verified** - Couldn't confirm if passwords were hashed correctly
3. ❌ **User model field mismatch** - User model expects `firstName` and `lastName`, not `name`
4. ❌ **Missing seed script** - No easy way to create fresh test users

## Solution

### 1. Fixed Files

#### `backend/scripts/init-db.js` ✅
**Change**: Updated to use correct User model fields
```javascript
// BEFORE (❌ WRONG):
const admin = await User.create({
  name: 'Ahmed Bennani',           // ❌ Wrong field
  email: 'admin@yaacoub.ma',
  password: 'Admin123!',
  role: 'admin',
  municipality: 'Yaacoub El Mansour'  // ❌ Field doesn't exist
});

// AFTER (✅ CORRECT):
const admin = await User.create({
  firstName: 'Admin',              // ✅ Correct field
  lastName: 'User',                // ✅ Correct field
  email: 'admin@yaacoub.ma',
  password: 'Admin123!',
  role: 'admin',
  phone: '+212 XXX XXX XXX',
  isActive: true
});
```

#### `backend/scripts/seed-demo-users.js` ✅ (NEW)
**Created**: New dedicated seed script for creating demo users
- Creates 3 test users with correct field mappings
- Uses proper bcrypt hashing (via User model setter)
- Provides clear success messages
- Shows all credentials for testing

#### `backend/package.json` ✅
**Added**: New npm script for easy seeding
```json
"seed:demo": "node scripts/seed-demo-users.js"
```

### 2. How Password Hashing Works

The User model automatically hashes passwords when creating/updating:

```javascript
// In backend/models/user.js:
password: {
  type: DataTypes.STRING,
  set(value) {
    if (!value) return;
    // Check if already hashed (starts with bcrypt prefix)
    if (!value.startsWith('$2')) {
      const salt = bcrypt.genSaltSync(10);
      this.setDataValue('password', bcrypt.hashSync(value, salt));
    } else {
      this.setDataValue('password', value);  // Already hashed
    }
  },
},
```

This means:
- ✅ When you pass `password: 'Admin123!'`, it gets hashed to `$2b$10$...`
- ✅ When you retrieve the user, `password` field contains the hash
- ✅ Login uses `bcrypt.compareSync(password, hash)` to verify

### 3. Password Verification in Login

The login process (in `backend/controllers/authController.js`):

```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // 2. Compare plaintext password with stored hash
  const passwordValid = user.checkPassword(password);  // Uses bcrypt.compareSync
  if (!passwordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // 3. Generate JWT token
  const token = generateToken(user);
  return res.json({ success: true, token, user });
};
```

## Setup Instructions

### Step 1: Clean Database and Recreate Schema

```bash
cd backend
npm run db:sync:force
```

This will:
- ✅ Drop all existing tables
- ✅ Recreate them with correct schema
- ✅ Clear any corrupted data

**Output should show:**
```
✅ Database synchronization completed successfully!
📋 Tables created/updated:
   - users
   - documentTypes
   - documents
   - requests
   - tasks
   - notifications
```

### Step 2: Seed Demo Users

```bash
npm run seed:demo
```

This will:
- ✅ Create 3 test users with valid credentials
- ✅ Hash passwords using bcrypt
- ✅ Print credentials for testing

**Output should show:**
```
✅ Admin user created:
   📧 Email: admin@yaacoub.ma
   🔐 Password: Admin123!
   👤 Role: admin

✅ Employee user created:
   📧 Email: employee@yaacoub.ma
   🔐 Password: Employee123!
   👤 Role: employee

✅ Citizen user created:
   📧 Email: fatima.alaoui@email.com
   🔐 Password: Password123!
   👤 Role: citizen
```

### Step 3: Start Backend

```bash
npm start
```

**Output should show:**
```
✅ Database connection successful
✅ Database synced
✅ Server on port 5001
```

### Step 4: Start Frontend

```bash
cd ../frontend
npm start
```

### Step 5: Test Login

Go to `http://localhost:3000/login` and try:

**Test 1: Admin Login**
- Email: `admin@yaacoub.ma`
- Password: `Admin123!`
- Expected: ✅ Redirect to home page

**Test 2: Employee Login**
- Email: `employee@yaacoub.ma`
- Password: `Employee123!`
- Expected: ✅ Redirect to home page

**Test 3: Citizen Login**
- Email: `fatima.alaoui@email.com`
- Password: `Password123!`
- Expected: ✅ Redirect to home page

## Debugging Guide

If login still fails, check these in order:

### 1. Check Backend Logs

Look for console output when attempting login:

```
=== LOGIN ATTEMPT ===
Raw request body: {"email":"admin@yaacoub.ma","password":"Admin123!"}
Extracted email: admin@yaacoub.ma
Extracted password length: 9
Validation passed, looking for user with email: admin@yaacoub.ma
User found: {
  id: '...',
  email: 'admin@yaacoub.ma',
  role: 'admin',
  passwordHashLength: 60,           // ✅ Should be ~60 chars
  passwordStartsWith: '$2b$',       // ✅ Should start with $2
  ...
}
About to check password...
Password check result: true         // ✅ Should be true
Direct bcrypt compare result: true  // ✅ Should be true
Login successful for user: admin@yaacoub.ma
```

**If "User not found"**: Database doesn't have users → Run `npm run seed:demo`

**If "Password check result: false"**: Password mismatch → Check you're using exact credentials

**If "passwordHashLength is wrong"**: Password wasn't hashed → Check User model setter

### 2. Verify Database Users

Use a database client to check users exist:

```sql
SELECT id, firstName, lastName, email, role, password FROM users;
```

Should show (passwords are hashed, much longer):
```
id | firstName | lastName | email                    | role    | password
---|-----------|----------|--------------------------|---------|----------
1  | Admin     | User     | admin@yaacoub.ma         | admin   | $2b$10$...
2  | Karim     | Employee | employee@yaacoub.ma      | employee| $2b$10$...
3  | Fatima    | Alaoui   | fatima.alaoui@email.com  | citizen | $2b$10$...
```

### 3. Verify Password Hashing

Test password hashing manually:

```bash
node
> const bcrypt = require('bcryptjs');
> const password = 'Admin123!';
> const salt = bcrypt.genSaltSync(10);
> const hash = bcrypt.hashSync(password, salt);
> hash  // Should print a bcrypt hash starting with $2b$
'$2b$10$...'
> bcrypt.compareSync('Admin123!', hash)  // Should be true
true
> bcrypt.compareSync('WrongPassword', hash)  // Should be false
false
```

### 4. Test Login Endpoint Directly

Using curl:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yaacoub.ma","password":"Admin123!"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@yaacoub.ma",
    "role": "admin"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**If you get "Invalid email or password":**
- Check email is exact match
- Check password is exact match
- Check user exists in database

## Common Issues and Solutions

### Issue: "User not found" message in logs

**Cause**: No users in database

**Solution**:
```bash
npm run seed:demo
```

---

### Issue: "Password check result: false"

**Cause**: Password mismatch or corruption

**Solution**:
1. Clear database: `npm run db:sync:force`
2. Seed again: `npm run seed:demo`
3. Use exact credentials shown in seed output

---

### Issue: "passwordStartsWith: undefined" in logs

**Cause**: Password field is null or corrupted

**Solution**:
1. Check User model has password field set in create
2. Verify password value is not empty string
3. Run seed again

---

### Issue: Login works in curl but fails in React frontend

**Cause**: CORS or header issue

**Solution**:
1. Check `CORS_ORIGIN` in backend `.env`: should be `http://localhost:3000`
2. Check `REACT_APP_API_URL` in frontend `.env`: should be `http://localhost:5001`
3. Check browser Network tab for actual request headers

## Test Credentials Summary

After running `npm run seed:demo`:

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@yaacoub.ma         | Admin123!     |
| Employee | employee@yaacoub.ma      | Employee123!  |
| Citizen  | fatima.alaoui@email.com  | Password123!  |

## What Was Changed

✅ `backend/scripts/init-db.js` - Fixed user field mappings  
✅ `backend/scripts/seed-demo-users.js` - NEW: Dedicated seed script  
✅ `backend/package.json` - Added `seed:demo` npm script  

## Files NOT Changed (Working Correctly)

- ✅ `backend/models/user.js` - Password hashing already correct
- ✅ `backend/controllers/authController.js` - Login logic already correct
- ✅ `backend/middleware/auth.js` - Token verification already correct
- ✅ All frontend files - Auth flow already correct

## Verification Checklist

After applying the fix:

- [ ] Run `npm run db:sync:force` in backend
- [ ] Run `npm run seed:demo` in backend
- [ ] Backend shows successful seeding with 3 users
- [ ] Start backend: `npm start`
- [ ] Start frontend: `cd ../frontend && npm start`
- [ ] Go to http://localhost:3000/login
- [ ] Test login with admin@yaacoub.ma / Admin123!
- [ ] Verify redirect to home page
- [ ] Check console shows successful token generation
- [ ] Check localStorage has 'token' key
- [ ] Test protected routes work without 401 errors

✅ **If all checks pass, authentication is fully fixed!**

## Next Steps (Optional)

1. **Add more test users**: Edit `backend/scripts/seed-demo-users.js`
2. **Use different credentials**: Modify password values before seeding
3. **Automate seeding on startup**: Call seed script from `server.js`
4. **Add user registration**: Use the register endpoint to create new users

## Security Notes

- ⚠️ These test credentials are for development only
- ⚠️ Never commit demo user credentials to production
- ⚠️ Change JWT_SECRET in production `.env`
- ⚠️ Use strong passwords for production users (12+ chars, mixed case, numbers, symbols)
