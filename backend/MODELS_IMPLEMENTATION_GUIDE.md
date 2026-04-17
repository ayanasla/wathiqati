# 🎯 Complete Sequelize Models Implementation Guide - Wathiqati

## ✅ What Has Been Created

### 1. **Professional Sequelize Models** ✓
- ✅ User.js - With password hashing and validations
- ✅ DocumentType.js - Complete with bilingual requirements
- ✅ Document.js - With file management attributes
- ✅ Request.js - With bilingual (FR/AR) support
- ✅ Task.js - With assignment and tracking
- ✅ Notification.js - With read status and metadata

### 2. **Proper Associations** (Following MERISE) ✓
- ✅ User ↔ Request (1:N) - Citizens create requests
- ✅ User ↔ Task (1:N) - Employees create and get assigned tasks
- ✅ User ↔ Document (1:N) - Staff processes documents
- ✅ User ↔ Notification (1:N) - Users receive notifications
- ✅ Request ↔ Document (1:N) - Requests have documents
- ✅ Request ↔ Task (1:N) - Requests have processing tasks
- ✅ DocumentType ↔ Document (1:N) - Types define documents

### 3. **Database Infrastructure** ✓
- ✅ Enhanced database.js with MySQL/PostgreSQL/SQLite support
- ✅ Comprehensive .env.example with all configuration options
- ✅ Automatic indexes on frequently queried columns
- ✅ Foreign key constraints with cascade rules

### 4. **Utility Scripts** ✓
- ✅ scripts/sync-db.js - Complete database synchronization
- ✅ Sample data seeding with real users and documents
- ✅ Transaction management examples
- ✅ Error handling and logging

### 5. **Documentation** ✓
- ✅ models/README.md - Complete model reference
- ✅ models/EXAMPLES.js - 15+ real-world code examples
- ✅ This implementation guide

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install sequelize mysql2 bcryptjs dotenv
```

### Step 2: Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your database credentials
# For development with MySQL:
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=wathiqati_db
```

### Step 3: Sync Database
```bash
# First time setup
npm run db:sync:force

# Or with sample data
npm run db:seed
```

### Step 4: Start Development
```bash
npm run dev
```

---

## 📦 File Structure

```
backend/
├── models/
│   ├── index.js                 # ⭐ Central associations
│   ├── user.js                  # User model (factory)
│   ├── DocumentType.js          # DocumentType model (factory)
│   ├── Document.js              # Document model (factory)
│   ├── request.js               # Request model (factory)
│   ├── Task.js                  # Task model (factory)
│   ├── Notification.js          # Notification model (factory)
│   ├── README.md                # Model documentation
│   ├── EXAMPLES.js              # 15+ usage examples
│   └── MERISE.md                # MERISE diagram

├── config/
│   ├── database.js              # ⭐ Enhanced DB config
│   └── constants.js             # Constants

├── scripts/
│   ├── sync-db.js               # ⭐ Database synchronization
│   ├── seed-db.js               # Sample data seeding
│   └── reset-db.js              # Reset database

├── .env.example                 # ⭐ Environment template
├── server.js                    # Express server
└── package.json
```

---

## 🔧 Database Configuration

### MySQL (Production Recommended)
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourPassword123
DB_NAME=wathiqati_db
DB_LOGGING=false
```

### PostgreSQL
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YourPassword123
DB_NAME=wathiqati_db
DB_SSL=false
```

### SQLite (Development Only)
```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

---

## 📊 Database Schema Overview

### Users Table
```sql
CREATE TABLE `users` (
  `id` CHAR(36),
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('citizen','employee','admin'),
  `department` VARCHAR(100),
  `position` VARCHAR(100),
  `nationalId` VARCHAR(50) UNIQUE,
  `address` TEXT,
  `isActive` BOOLEAN DEFAULT true,
  `lastLoginAt` DATETIME,
  `createdAt` DATETIME,
  `updatedAt` DATETIME,
  PRIMARY KEY (`id`),
  INDEX (`email`),
  INDEX (`nationalId`),
  INDEX (`role`)
);
```

### Requests Table
```sql
CREATE TABLE `requests` (
  `id` CHAR(36),
  `requestNumber` VARCHAR(50) UNIQUE NOT NULL,
  `status` ENUM('pending','approved','rejected','processing','completed'),
  `priority` ENUM('low','medium','high','urgent'),
  `userId` CHAR(36) NOT NULL,
  `requestType` VARCHAR(100),
  `purpose` TEXT,
  ... (bilingual fields)
  ... (family information)
  ... (processing fields)
  `createdAt` DATETIME,
  `updatedAt` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
  INDEX (`userId`),
  INDEX (`status`),
  INDEX (`requestNumber`)
);
```

*Similar for Documents, Tasks, Notifications, DocumentTypes*

---

## 💻 Common Code Patterns

### Pattern 1: Creating Related Data
```javascript
const { User, Request, Document } = require('./models');

const createRequestWithDocuments = async (userId, docTypeId) => {
  const request = await Request.create({
    requestNumber: `REQ-${Date.now()}`,
    userId,
    status: 'pending',
    // ... other fields
  });

  const document = await Document.create({
    requestId: request.id,
    documentTypeId: docTypeId,
    status: 'pending',
  });

  return request;
};
```

### Pattern 2: Querying with Relationships
```javascript
// Get user with all related data
const user = await User.findByPk(id, {
  include: [
    { association: 'requests', include: ['documents'] },
    { association: 'assignedTasks' },
    { association: 'notifications', where: { isRead: false } },
  ],
});
```

### Pattern 3: Transactions (Safe Operations)
```javascript
const transaction = await sequelize.transaction();

try {
  const request = await Request.create(data, { transaction });
  const document = await Document.create({
    requestId: request.id,
    // ...
  }, { transaction });
  
  await transaction.commit();
  return request;
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### Pattern 4: Counts and Statistics
```javascript
const stats = {
  totalUsers: await User.count(),
  pendingRequests: await Request.count({ 
    where: { status: 'pending' } 
  }),
  documentsByStatus: await Document.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
  }),
};
```

---

## 🗄️ NPM Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:sync": "node scripts/sync-db.js sync",
    "db:sync:force": "node scripts/sync-db.js force",
    "db:seed": "node scripts/sync-db.js seed",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## 🔒 Security Features

### 1. Password Hashing
```javascript
// Automatic hashing in User model
const user = await User.create({
  password: 'PlainPassword123' // Automatically hashed
});
```

### 2. Foreign Key Constraints
```javascript
// Cascading deletes - delete user → delete their requests
User.hasMany(Request, { onDelete: 'CASCADE' });

// Restrict deletion of document types if docs exist
DocumentType.hasMany(Document, { onDelete: 'RESTRICT' });
```

### 3. Validation Rules
```javascript
{
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true }  // Email format
  },
  password: {
    validate: { len: [8, 255] }  // Min 8 chars
  }
}
```

---

## 📋 Models Quick Reference

| Model | Key Fields | Primary Role |
|-------|-----------|--------------|
| **User** | id, email, role, password | Authentication & authorization |
| **Request** | requestNumber, status, userId | Document request tracking |
| **Document** | title, status, requestId | Document generation |
| **DocumentType** | name, code, processingTime | Request templates |
| **Task** | status, priority, assignedUserId | Workflow management |
| **Notification** | message, isRead, userId | User notifications |

---

## 🎓 Advanced Examples

See `models/EXAMPLES.js` for:
1. ✅ User creation and authentication
2. ✅ Request creation and approval flow
3. ✅ Document processing
4. ✅ Task assignment and tracking
5. ✅ Notification management
6. ✅ Dashboard statistics
7. ✅ Transaction handling

---

## 🐛 Troubleshooting

### "Table already exists"
```bash
npm run db:sync:force  # Force rebuild (DEV ONLY)
```

### "Unknown column in where clause"
✅ Use correct field names from model definition
```javascript
// ❌ Wrong - no such field
Request.findAll({ where: { request_id: id } });

// ✅ Correct
Request.findAll({ where: { requestId: id } });
```

### "Cannot add or update a child row"
✅ Parent record must exist first
```javascript
// Create user first
const user = await User.create({ /* ... */ });

// Then create request
const request = await Request.create({
  userId: user.id,  // Must exist
  // ...
});
```

### Password not being hashed
✅ Use the setter defined in User model
```javascript
// ✅ Correct - triggers setter
const user = await User.create({ password: 'test123' });

// ❌ Wrong - bypasses setter
user.password = 'test123';
```

---

## 📚 Integration with Controllers

### Example Controller
```javascript
// controllers/requestController.js
const { Request, Document, User } = require('../models');

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      userId: req.user.id,  // From auth middleware
    });
    
    res.status(201).json({
      success: true,
      data: request,
      message: 'Request created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: ['documents', 'tasks', 'user']
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Use MySQL/PostgreSQL (not SQLite)
- [ ] Configure proper database backups
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for specific domain
- [ ] Set up database indexes
- [ ] Test all relationships and constraints
- [ ] Implement proper error handling
- [ ] Set up monitoring and logging
- [ ] Review security validations
- [ ] Test database recovery procedures

---

## 📞 Support & Resources

- **Sequelize Docs**: https://sequelize.org/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✨ Summary

Your Wathiqati project now has:

✅ **6 Professional Models** with complete attributes
✅ **Correct Associations** following MERISE diagram
✅ **Database Configuration** for MySQL/PostgreSQL/SQLite
✅ **Synchronization Scripts** for easy setup
✅ **Sample Data Seeding** for development
✅ **Complete Documentation** with examples
✅ **Security Features** (hashing, constraints, validation)

**Next Steps:**
1. Run `npm install sequelize mysql2 bcryptjs`
2. Configure `.env` file
3. Run `npm run db:seed`
4. Start using models in your controllers!

🎉 **Ready for production-grade development!**
