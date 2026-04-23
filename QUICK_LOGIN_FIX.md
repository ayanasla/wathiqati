# Quick Fix Card - Login Authentication "Invalid email or password"

## 🚀 Quick Start (3 Commands)

```bash
# 1. Reset database schema
cd backend
npm run db:sync:force

# 2. Create test users with correct credentials
npm run seed:demo

# 3. Start backend
npm start
```

## 📋 Test Credentials

After running the commands above, use these to log in:

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@yaacoub.ma         | Admin123!     |
| Employee | employee@yaacoub.ma      | Employee123!  |
| Citizen  | fatima.alaoui@email.com  | Password123!  |

## ❌ If Still Getting "Invalid email or password"

1. **Check backend logs** - Is user found?
   ```
   User not found → Run: npm run seed:demo
   Password check result: false → Check password is exact match
   ```

2. **Verify database has users**
   - Use MySQL/SQLite client to check: `SELECT * FROM users;`
   - Should show 3 users with hashed passwords

3. **Check frontend environment**
   - Frontend `.env` should have: `REACT_APP_API_URL=http://localhost:5001`
   - Or use correct backend port

4. **Test with curl**
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@yaacoub.ma","password":"Admin123!"}'
   ```
   - If this fails, backend is not responding correctly
   - If this works, frontend has a configuration issue

## 🔍 What Was Fixed

| Issue | Fix |
|-------|-----|
| Init script used wrong field names | Updated `scripts/init-db.js` to use `firstName`/`lastName` |
| No easy way to create users | Created new `scripts/seed-demo-users.js` |
| User creation fields missing | Added all required fields (`role`, `phone`, `isActive`) |
| npm script didn't exist | Added `seed:demo` script to `package.json` |

## 📁 Changed Files

1. ✅ `backend/scripts/init-db.js` - Fixed user field mappings
2. ✅ `backend/scripts/seed-demo-users.js` - NEW seed script
3. ✅ `backend/package.json` - Added `seed:demo` npm script

## 💡 How Password Hashing Works

```
User Input:  "Admin123!"
    ↓
User Model Setter (automatically)
    ↓
bcrypt.hashSync() → "$2b$10$..." (60 char hash)
    ↓
Stored in Database
    ↓
On Login:
    ↓
User enters: "Admin123!"
    ↓
bcrypt.compareSync(plaintext, hash)
    ↓
Result: true ✅ or false ❌
```

## 🎯 Verification Steps

```bash
# 1. Check schema created
mysql -u root -p wathiqati_db -e "DESCRIBE users;"

# 2. Check users exist with hashes
mysql -u root -p wathiqati_db -e "SELECT firstName, email, password FROM users;"

# 3. Test backend directly
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yaacoub.ma","password":"Admin123!"}'

# 4. Check response has token
# Should return: {"success":true,"token":"eyJ...","user":{...}}
```

## 🛠️ If You Need to Debug Password Hashing

```bash
# Open Node REPL
node

# Test bcrypt
const bcrypt = require('bcryptjs');
const password = 'Admin123!';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log('Hash:', hash);

// Verify
console.log('Verify correct:', bcrypt.compareSync('Admin123!', hash));    // true
console.log('Verify wrong:', bcrypt.compareSync('WrongPassword', hash));  // false

# Exit
.exit
```

## 📞 Common Scenarios

### Scenario 1: Login works in curl but not in React
**Check**: 
- CORS_ORIGIN in backend `.env`
- REACT_APP_API_URL in frontend `.env`
- Browser Network tab for actual request

### Scenario 2: User found but password fails
**Check**:
- Password is exact match (case-sensitive!)
- No extra spaces in password field
- Database has hashed passwords (starts with $2b$)

### Scenario 3: User not found
**Solution**: Run `npm run seed:demo` again

## 📊 Expected Database State

After `npm run seed:demo`:

```
MySQL> SELECT id, firstName, email, role, LENGTH(password) as hash_length FROM users;

+------+--------+-----------------------------+----------+-------------+
| id   | name   | email                       | role     | hash_length |
+------+--------+-----------------------------+----------+-------------+
| 1    | Admin  | admin@yaacoub.ma            | admin    |          60 |
| 2    | Karim  | employee@yaacoub.ma         | employee |          60 |
| 3    | Fatima | fatima.alaoui@email.com     | citizen  |          60 |
+------+--------+-----------------------------+----------+-------------+

Note: password column shows hash (60 chars), not plaintext
```

## ✅ Success Indicators

When login works:

1. **Backend logs**:
   ```
   Login successful for user: admin@yaacoub.ma
   Password check result: true
   ```

2. **Browser Network tab**:
   - Status: `200` (not 401)
   - Response: `{"success":true,"token":"eyJ...","user":{...}}`

3. **Browser localStorage**:
   - Has `token` key
   - Has `user` key

4. **Frontend behavior**:
   - Redirects from `/login` to `/`
   - Can access protected routes
   - No 401 errors on subsequent requests

## 🎓 Learning Resources

To understand the full flow:
- Read: `AUTH_FIX_SUMMARY.md` - Comprehensive analysis
- Read: `CODE_CHANGES_DETAILED.md` - Side-by-side code diffs
- Check: `backend/models/user.js` - Password setter logic
- Check: `backend/controllers/authController.js` - Login flow
- Check: `backend/middleware/auth.js` - Token verification

---

**Status**: ✅ Ready to use  
**Last Updated**: 2026-04-21  
**Next Steps**: Run the 3 quick start commands above
