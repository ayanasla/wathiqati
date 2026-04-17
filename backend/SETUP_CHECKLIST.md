# ✅ WATHIQATI MODELS SETUP CHECKLIST

## 🎯 Pre-Setup Verification

- [ ] Node.js installed (`node --version` → v14+)
- [ ] npm installed (`npm --version`)
- [ ] MySQL/PostgreSQL installed (or choose SQLite for dev)
- [ ] Create empty database (for MySQL/PostgreSQL)
- [ ] VS Code with extensions: ES7+ Snippets, Prettier, ESLint

---

## 📦 Step 1: Install Dependencies (2 minutes)

```bash
cd backend
npm install sequelize mysql2 bcryptjs dotenv
```

- [ ] Sequelize installed
- [ ] MySQL2 driver installed (or pg for PostgreSQL)
- [ ] bcryptjs installed
- [ ] dotenv installed

---

## 🔧 Step 2: Environment Setup (3 minutes)

### Create .env file:
```bash
cp .env.example .env
```

### Edit .env with your settings:

**For MySQL:**
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=wathiqati_db
NODE_ENV=development
PORT=3001
```

**For PostgreSQL:**
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=wathiqati_db
```

**For SQLite (Development):**
```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

Checklist:
- [ ] .env file created from .env.example
- [ ] Database credentials configured
- [ ] NODE_ENV set to 'development'
- [ ] PORT set (default: 3001)
- [ ] JWT_SECRET configured (update for production)

---

## 🗄️ Step 3: Create Database (1 minute)

### MySQL:
```bash
mysql -u root -e "CREATE DATABASE wathiqati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### PostgreSQL:
```bash
psql -U postgres -c "CREATE DATABASE wathiqati_db WITH ENCODING 'UTF8';"
```

### SQLite:
No setup needed - created automatically

- [ ] Database created successfully
- [ ] Database is empty and ready

---

## 🔄 Step 4: Sync Database Models (2 minutes)

### First time setup (no data loss):
```bash
npm run db:sync
```

### If you want sample data:
```bash
npm run db:seed
```

Output should show:
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

Checklist:
- [ ] No errors during sync
- [ ] All 6 tables created
- [ ] Indexes created
- [ ] Sample data seeded (if chosen)

---

## ✔️ Step 5: Verify Models (2 minutes)

### Test in Node REPL:
```bash
node
```

Then in REPL:
```javascript
const { User, Request, Document } = require('./models');

// Check if models are loaded
console.log(User.name);  // Should print "User"

// Test a simple query
User.findAll().then(users => console.log(users.length));

// Exit
.exit
```

Checklist:
- [ ] Models load without errors
- [ ] User.findAll() works
- [ ] No connection errors
- [ ] Data types are correct

---

## 📝 Step 6: Update package.json Scripts

Add these scripts to your `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:sync": "node scripts/sync-db.js sync",
    "db:sync:force": "node scripts/sync-db.js force",
    "db:seed": "node scripts/sync-db.js seed",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

Checklist:
- [ ] Scripts added to package.json
- [ ] `npm run dev` works
- [ ] `npm run db:sync` works
- [ ] `npm run db:seed` works

---

## 🚀 Step 7: Test in Your Code

### Create a test file: `test-models.js`

```javascript
require('dotenv').config();
const { User, Request, Document, sequelize } = require('./models');

async function test() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test queries
    const userCount = await User.count();
    console.log(`✅ User count: ${userCount}`);

    const requestCount = await Request.count();
    console.log(`✅ Request count: ${requestCount}`);

    console.log('✅ All models working!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
```

Run test:
```bash
node test-models.js
```

Expected output:
```
✅ Database connected
✅ User count: 3 (or more if seeded)
✅ Request count: 1 (or more if seeded)
✅ All models working!
```

Checklist:
- [ ] Test file runs without errors
- [ ] Database connection successful
- [ ] Can query users
- [ ] Can query requests

---

## 📚 Step 8: Review Documentation

Read these files to understand your setup:

- [ ] `models/README.md` - Complete model reference
- [ ] `models/EXAMPLES.js` - 15 code examples
- [ ] `MODELS_IMPLEMENTATION_GUIDE.md` - Full guide
- [ ] `SEQUELIZE_MODELS_SUMMARY.md` - Summary

---

## 💻 Step 9: Start Building API Routes

### Example: Create user route

```javascript
// routes/users.js
const express = require('express');
const { User } = require('../models');

const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: ['requests', 'notifications']
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

Checklist:
- [ ] Route created
- [ ] Can POST to create users
- [ ] Can GET users with relationships

---

## 🎯 Step 10: Production Preparation

Before deploying:

- [ ] Use MySQL/PostgreSQL (not SQLite for production)
- [ ] Set `NODE_ENV=production` in production
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up database backups
- [ ] Test error handling
- [ ] Review all validations
- [ ] Set up monitoring
- [ ] Create database indexes (run manually or via migrations)

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'sequelize'"
```bash
npm install sequelize mysql2
```

### Issue: "ER_Access_denied_for_user"
Check `.env` database credentials

### Issue: "ER_NO_REFERENCED_TABLE"
Foreign key referencing non-existent table
```bash
npm run db:sync:force  # WARNING: Destructive for development only
```

### Issue: Models not loading
Verify imports in `models/index.js`

### Issue: Password not being hashed
Ensure using the User model setter:
```javascript
const user = await User.create({ password: 'test123' });
// Password automatically hashed by setter
```

---

## 📋 File Checklist

### Models
- [ ] `models/user.js` - User model ✅
- [ ] `models/DocumentType.js` - Document type model ✅
- [ ] `models/Document.js` - Document model ✅
- [ ] `models/request.js` - Request model ✅
- [ ] `models/Task.js` - Task model ✅
- [ ] `models/Notification.js` - Notification model ✅
- [ ] `models/index.js` - All associations ✅

### Config
- [ ] `config/database.js` - Database config ✅
- [ ] `.env.example` - Environment template ✅
- [ ] `.env` - Your environment file ✅ (created)

### Scripts
- [ ] `scripts/sync-db.js` - Sync script ✅

### Documentation
- [ ] `models/README.md` - Model reference ✅
- [ ] `models/EXAMPLES.js` - Code examples ✅
- [ ] `MODELS_IMPLEMENTATION_GUIDE.md` - Full guide ✅
- [ ] `SEQUELIZE_MODELS_SUMMARY.md` - Summary ✅
- [ ] This checklist ✅

### Utils
- [ ] `utils/responses.js` - Response format ✅

---

## ✨ Success Criteria

**Your setup is complete when:**

- ✅ All dependencies installed
- ✅ .env file configured
- ✅ Database created and accessible
- ✅ Models synced to database
- ✅ All 6 tables exist in database
- ✅ Can query models without errors
- ✅ Sample data exists (if seeded)
- ✅ Relationships work (includes with associations)
- ✅ Code examples run successfully
- ✅ API routes can use models

---

## 🚀 Next Steps

1. **Build API Routes** - Use models in your controllers
2. **Add Authentication** - User login/register with JWT
3. **Create Services** - Business logic layer
4. **Add Middleware** - Auth, validation, error handling
5. **Write Tests** - Unit and integration tests
6. **Deploy** - Set up on production server

---

## 📞 Quick Commands

```bash
# Install dependencies
npm install sequelize mysql2 bcryptjs

# Setup database
npm run db:sync              # Sync models
npm run db:seed              # Sync and seed data
npm run db:sync:force        # Force recreate (DEV ONLY)

# Development
npm run dev                  # Start with nodemon

# Testing
node test-models.js          # Test models

# View documentation
cat models/README.md
cat models/EXAMPLES.js
```

---

## 🎉 You're All Set!

Your Wathiqati project now has:

✅ 6 professional Sequelize models
✅ Proper database relationships
✅ Complete documentation
✅ Working examples
✅ Database synchronization
✅ Sample data
✅ Error handling utilities

**Start building your API! 🚀**
