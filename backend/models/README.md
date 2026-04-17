# Sequelize Models - Wathiqati Project

## 📚 Overview

This directory contains all Sequelize ORM models for the Wathiqati document request management system. The models follow the MERISE (Merise Entity-Relationship Model) data model specification and include proper relationships, validations, and lifecycle management.

## 📋 Models

### 1. **User** (`user.js`)
Represents all users in the system with role-based access control.

**Attributes:**
```js
{
  id: UUID (primary),
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: ENUM ['citizen', 'employee', 'admin'],
  department: String,
  position: String,
  nationalId: String (unique),
  address: Text,
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Methods:**
- `comparePassword(password)` - Verify password hash

**Relationships:**
- ➡️ One-to-Many: `requests` (User has many Requests)
- ➡️ One-to-Many: `createdTasks` (User creates Tasks)
- ➡️ One-to-Many: `assignedTasks` (Tasks assigned to User)
- ➡️ One-to-Many: `processedDocuments` (User processes Documents)
- ➡️ One-to-Many: `notifications` (User receives Notifications)

---

### 2. **DocumentType** (`documentType.js`)
Defines types of documents available for request.

**Attributes:**
```js
{
  id: Integer (auto-increment),
  name: String (unique),
  code: String (unique),
  description: Text,
  processingTime: Integer (days),
  price: Decimal,
  isActive: Boolean,
  requirementsFr: Text,
  requirementsAr: Text,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- ⬅️ One-to-Many: `documents` (DocumentType has many Documents)

---

### 3. **Request** (`request.js`)
Represents document requests made by citizens.

**Attributes:**
```js
{
  id: UUID (primary),
  requestNumber: String (unique, auto-generated),
  status: ENUM ['pending', 'approved', 'rejected', 'processing', 'completed'],
  priority: ENUM ['low', 'medium', 'high', 'urgent'],
  userId: UUID (FK to User),
  
  // Request Details
  requestType: String,
  purpose: Text,
  
  // Applicant Information
  firstNameFr: String,
  lastNameFr: String,
  firstNameAr: String,
  lastNameAr: String,
  dateOfBirth: Date,
  placeOfBirthFr: String,
  placeOfBirthAr: String,
  nationalId: String,
  addressFr: Text,
  addressAr: Text,
  phone: String,
  
  // Parent Information
  fatherNameFr: String,
  fatherNameAr: String,
  motherNameFr: String,
  motherNameAr: String,
  
  // Processing
  notes: Text,
  adminNotes: Text,
  pickupLocation: String,
  rejectionReason: Text,
  pdfUrl: String,
  
  // Dates
  approvedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- ⬅️ Belongs-to: `user` (Request belongs to User)
- ➡️ One-to-Many: `documents` (Request has many Documents)
- ➡️ One-to-Many: `tasks` (Request has many Tasks)

---

### 4. **Document** (`Document.js`)
Represents generated/processed documents.

**Attributes:**
```js
{
  id: UUID (primary),
  title: String,
  description: Text,
  status: ENUM ['pending', 'processing', 'ready', 'rejected', 'expired'],
  filePath: String,
  fileName: String,
  fileSize: Integer,
  mimeType: String,
  requestId: UUID (FK),
  documentTypeId: Integer (FK),
  processedByUserId: UUID (FK, nullable),
  rejectionReason: Text,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- ⬅️ Belongs-to: `request` (Document belongs to Request)
- ⬅️ Belongs-to: `documentType` (Document belongs to DocumentType)
- ⬅️ Belongs-to: `processor` (processed by User)

---

### 5. **Task** (`Task.js`)
Represents tasks for processing requests.

**Attributes:**
```js
{
  id: UUID (primary),
  title: String,
  description: Text,
  status: ENUM ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  priority: ENUM ['low', 'medium', 'high', 'urgent'],
  requestId: UUID (FK, nullable),
  createdByUserId: UUID (FK),
  assignedUserId: UUID (FK, nullable),
  deadline: Date,
  startedAt: Date,
  completedAt: Date,
  dueDate: Date,
  estimatedHours: Decimal,
  actualHours: Decimal,
  notes: Text,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- ⬅️ Belongs-to: `request` (Task belongs to Request)
- ⬅️ Belongs-to: `creator` (created by User)
- ⬅️ Belongs-to: `assignee` (assigned to User)

---

### 6. **Notification** (`Notification.js`)
Represents notifications sent to users.

**Attributes:**
```js
{
  id: UUID (primary),
  userId: UUID (FK),
  title: String,
  message: Text,
  type: ENUM ['request', 'task', 'document', 'system', 'approval', 'rejection'],
  priority: ENUM ['low', 'medium', 'high', 'urgent'],
  relatedEntityType: String,
  relatedEntityId: UUID,
  isRead: Boolean,
  readAt: Date,
  actionUrl: String,
  metadata: JSON,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- ⬅️ Belongs-to: `user` (Notification sent to User)

---

## 🔗 Entity Relationship Diagram

```
┌─────────┐
│  User   │ (citizens, employees, admins)
└────┬────┘
     │
     ├──── 1:N ────> Request (document requests)
     │                  │
     │                  └──── 1:N ────> Document (with DocumentType FK)
     │                  │
     │                  └──── 1:N ────> Task
     │
     ├──── 1:N ────> Task (created by user)
     ├──── 1:N ────> Task (assigned to user)
     ├──── 1:N ────> Document (processed by user)
     └──── 1:N ────> Notification

DocumentType
     │
     └──── 1:N ────> Document
```

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
npm install sequelize mysql2 bcryptjs dotenv

# For PostgreSQL
npm install pg pg-hstore

# For SQLite (development only)
npm install sqlite3
```

### 2. Environment Setup

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# MySQL
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wathiqati_db
```

### 3. Sync Database

**Option 1: Safe Sync (development)**
```bash
npm run db:sync
# Creates tables if they don't exist, alters if they do
```

**Option 2: Force Sync (development only - DESTRUCTIVE)**
```bash
npm run db:sync:force
# ⚠️ WARNING: Drops all tables and recreates them
```

**Option 3: Sync with Sample Data**
```bash
npm run db:seed
# Syncs database and fills with sample data
```

### 4. Update `package.json` Scripts

Add these scripts to your `backend/package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "db:sync": "node scripts/sync-db.js sync",
  "db:sync:force": "node scripts/sync-db.js force",
  "db:seed": "node scripts/sync-db.js seed"
}
```

---

## 💻 Usage Examples

### Create User
```javascript
const { User } = require('./models');

const user = await User.create({
  firstName: 'Ahmed',
  lastName: 'Ali',
  email: 'ahmed@example.com',
  password: 'SecurePass@123',
  role: 'citizen',
});
```

### Create Request with Documents
```javascript
const { Request, Document } = require('./models');

const request = await Request.create({
  requestNumber: `REQ-${Date.now()}`,
  userId: userId,
  requestType: 'Birth Certificate',
  status: 'pending',
  firstNameFr: 'Ahmed',
  lastNameFr: 'Ali',
});

const document = await Document.create({
  requestId: request.id,
  documentTypeId: 1,
  title: 'Birth Certificate',
  status: 'pending',
});
```

### Query with Associations
```javascript
// Get user with all requests and documents
const user = await User.findByPk(userId, {
  include: [
    {
      association: 'requests',
      include: ['documents'],
    },
    {
      association: 'notifications',
      where: { isRead: false },
      required: false,
    },
  ],
});
```

### Transaction Example
```javascript
const transaction = await sequelize.transaction();

try {
  const request = await Request.create({ /* ... */ }, { transaction });
  const document = await Document.create({
    requestId: request.id,
    // ...
  }, { transaction });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}
```

---

## 📊 Database Indexes

All models include indexes on frequently queried columns:

**User:** `email`, `nationalId`, `role`
**DocumentType:** `code`, `isActive`
**Document:** `requestId`, `documentTypeId`, `status`, `processedByUserId`
**Request:** `userId`, `status`, `requestNumber`, `priority`, `createdAt`
**Task:** `requestId`, `createdByUserId`, `assignedUserId`, `status`, `priority`, `deadline`
**Notification:** `userId`, `isRead`, `type`, `createdAt`, composite `(userId, isRead)`

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ UUID primary keys
- ✅ SQL injection prevention (Sequelize parameterized queries)
- ✅ Cascading delete/update rules
- ✅ Foreign key constraints
- ✅ Timestamps (createdAt, updatedAt)

---

## 📝 Best Practices

1. **Always use transactions for multi-step operations**
   ```js
   const transaction = await sequelize.transaction();
   try {
     // Multiple operations
     await transaction.commit();
   } catch {
     await transaction.rollback();
   }
   ```

2. **Use associations for eager loading**
   ```js
   // ✅ Good - loads related data in one query
   const user = await User.findByPk(id, {
     include: ['requests', 'notifications']
   });
   ```

3. **Avoid N+1 queries**
   ```js
   // ❌ Bad
   const users = await User.findAll();
   for (const user of users) {
     user.requests = await user.getRequests();
   }
   
   // ✅ Good
   const users = await User.findAll({
     include: ['requests']
   });
   ```

4. **Use scopes for common queries**
   ```js
   Request.addScope('pending', { 
     where: { status: 'pending' } 
   });
   ```

---

## 🐛 Troubleshooting

### "ER_NO_REFERENCED_TABLE"
Foreign key references a table that doesn't exist. Ensure parent models sync first.

### "ER_DUP_ENTRY"
Unique constraint violation. Check for duplicate values in unique columns.

### "Sequelize Connection Refused"
Database not running or credentials wrong. Check `.env` database settings.

### Transaction Deadlock
Use `SERIALIZABLE` isolation level for critical operations.

---

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MERISE Methodology](https://en.wikipedia.org/wiki/Merise)

---

## 📄 License

MIT License - See LICENSE file in project root
