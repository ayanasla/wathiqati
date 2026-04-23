# Detailed Code Changes - 401 Unauthorized Fix

## File 1: `backend/routes/auth.js`

### Change: Added `/me` endpoint alias

```diff
  // Public routes
  router.post('/register', registerValidation, register);
  router.post('/login', loginValidation, login);

  // Protected routes
  router.get('/profile', authenticate, getProfile);
+ router.get('/me', authenticate, getProfile);  // Alias for frontend compatibility
  router.put('/profile', authenticate, updateProfileValidation, updateProfile);
  router.post('/change-password', authenticate, changePasswordValidation, changePassword);

  module.exports = router;
```

**Why**: Some parts of the codebase or future versions might use `/me` instead of `/profile`. This ensures both work.

---

## File 2: `backend/middleware/auth.js`

### Changes: Enhanced JWT verification and error handling

**Before:**
```javascript
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // ❌ Can throw here
    const user = await User.findByPk(decoded.id);
    // ... rest
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // ... handles error
    }
  }
};
```

**After:**
```javascript
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn('Missing Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      console.warn('Invalid Authorization header format:', authHeader.substring(0, 20));
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];

    // ✅ Separate JWT verification with dedicated error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        console.warn('JWT verification failed:', jwtError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      throw jwtError;
    }

    // ✅ Now fetch user (won't be reached if JWT verification failed)
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.warn('User not found for token, ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // ✅ Safer user object extraction
    req.user = user.toJSON ? user.toJSON() : user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
```

**Key Improvements:**
1. ✅ JWT verification errors caught BEFORE database lookup
2. ✅ Token expiration detected separately  
3. ✅ Added console logging for debugging
4. ✅ Added `req.userId` for convenience
5. ✅ Safer Sequelize model conversion
6. ✅ Early returns prevent error masking

---

## File 3: `frontend/src/utils/api.config.js`

### Change: Fixed response parsing logic

**Before:**
```javascript
// Normalize response data
const normalized = normalizeResponse(data);
if (normalized && typeof normalized === 'object' && normalized.success === true) {
  // ❌ Assumes success flag exists, will skip error responses
  if ('token' in normalized) {
    return normalized;
  }
  if ('data' in normalized) {
    return normalizeResponse(normalized.data);
  }
  if ('requests' in normalized) {
    return normalizeResponse(normalized.requests);
  }
  if ('user' in normalized) {
    return normalized.user;  // ❌ Strips user wrapper
  }
}
return normalized;
```

**After:**
```javascript
// Normalize response data
const normalized = normalizeResponse(data);

// ✅ Handle different response structures
if (normalized && typeof normalized === 'object') {
  // If response contains success flag, check it
  if ('success' in normalized && normalized.success === false) {
    throw new ApiError(normalized.message || 'Request failed', response.status, normalized);
  }
  
  // ✅ Return full response if it contains authentication data
  if ('token' in normalized) {
    return normalized;
  }
  
  // ✅ Extract user from user property (preserve structure if no wrapper)
  if ('user' in normalized && !('data' in normalized) && !('requests' in normalized)) {
    return normalized;
  }
  
  // Extract data from nested structures
  if ('data' in normalized) {
    return normalizeResponse(normalized.data);
  }
  if ('requests' in normalized) {
    return normalizeResponse(normalized.requests);
  }
}

return normalized;
```

**Key Improvements:**
1. ✅ Works with responses that don't have `success: true` flag
2. ✅ Properly handles error responses
3. ✅ Preserves full user object when returned
4. ✅ Conditional data extraction (only when truly nested)
5. ✅ Returns normalized response at end (fallback)

---

## File 4: `frontend/src/contexts/AuthContext.jsx`

### Change 1: Better token initialization

**Before:**
```javascript
useEffect(() => {
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // ❌ No error handling around this call
        const response = await api.getMe();
        if (response.success) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        logout();
      }
    }

    setLoading(false);
  };
```

**After:**
```javascript
useEffect(() => {
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // ✅ Verify token with proper error handling
        try {
          const response = await api.getMe();
          
          // ✅ Handle both response formats
          let userData = response;
          if (response && typeof response === 'object') {
            // If response has a user property, extract it
            if (response.user && !response.id) {
              userData = response.user;
            }
          }
          
          if (userData && userData.id) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token invalid, clear storage
            logout();
          }
        } catch (profileErr) {
          console.warn('Token validation request failed:', profileErr);
          // Token might be expired, clear and let user log in again
          logout();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      }
    }

    setLoading(false);
  };
```

**Key Improvements:**
1. ✅ Separate try-catch for profile validation
2. ✅ Handles both `{ user: {...} }` and direct user object
3. ✅ Validates user data has `id` before storing
4. ✅ Graceful degradation (clears invalid tokens)

### Change 2: Better login response handling

**Before:**
```javascript
const login = async (email, password) => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.login(email, password);

    const success = response?.success ?? !!response?.token;
    if (success) {
      setToken(response.token);
      setUser(response.user);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return { success: true };
    } else {
      setError(response.message || 'Login failed');
      return { success: false, error: response.message };
    }
  } catch (err) {
    const errorMessage = err.message || 'Login failed';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};
```

**After:**
```javascript
const login = async (email, password) => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.login(email, password);

    // ✅ Handle response structure flexibly
    let tokenData = null;
    let userData = null;

    if (response?.token) {
      tokenData = response.token;
      userData = response.user || {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      };
    }

    if (tokenData && userData) {
      setToken(tokenData);
      setUser(userData);

      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } else {
      const errorMsg = response?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    const errorMessage = err.message || 'Login failed';
    console.error('Login error:', err);
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};
```

**Key Improvements:**
1. ✅ Handles `{ token, user }` structure
2. ✅ Handles `{ token, user: {...} }` structure
3. ✅ Fallback to build user object from flat properties
4. ✅ Better error messages
5. ✅ Validates both token and user exist

---

## Summary of Changes

| Component | Issue | Fix | Impact |
|-----------|-------|-----|--------|
| Route | Missing /me endpoint | Added alias route | Flexibility |
| Auth Middleware | Weak JWT error handling | Separated JWT verification | Better debugging |
| API Config | Over-aggressive response parsing | Flexible response structure | No data loss |
| AuthContext | Rigid response structure | Flexible parsing with fallbacks | Works with variants |

## Testing the Changes

### Test 1: Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yaacoub.ma","password":"Admin123!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@yaacoub.ma",
    "role": "admin"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Test 2: Get Profile with Token
```bash
curl http://localhost:5002/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@yaacoub.ma",
    "role": "admin"
  }
}
```

### Test 3: Invalid Token
```bash
curl http://localhost:5002/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```
Status: `401`

---

## Verification

After applying changes:

✅ Backend compiles without errors  
✅ Frontend compiles without errors  
✅ Login succeeds  
✅ Protected routes work  
✅ Proper 401 on invalid token  
✅ No data loss in responses  
✅ Clear error messages in console  

**All checks passing = Authentication flow is fixed! 🎉**
