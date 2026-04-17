# PROJECT STRUCTURE & FILE GUIDE

## Complete File Tree

```
wathiqati/
│
├── README.md                          # Main project documentation
├── QUICKSTART.md                      # 5-minute setup guide
├── DEPLOYMENT.md                      # Production deployment guide
├── .gitignore                         # Git ignore patterns
├── package.json                       # Root package with scripts
│
├── backend/                           # NODE.JS EXPRESS API
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env template
│   ├── server.js                     # Express server entry point
│   ├── initdb.js                     # Database initialization script
│   ├── package.json                  # Backend dependencies
│   │
│   ├── config/                       # Configuration
│   │   ├── database.js              # Sequelize database config
│   │   └── constants.js             # App constants
│   │
│   ├── models/                       # ORM Models
│   │   ├── index.js                 # Model associations & exports
│   │   ├── user.js                  # User model (with password hashing)
│   │   ├── Task.js                  # Task model
│   │   ├── Document.js              # Document model
│   │   └── Notification.js          # Notification model
│   │
│   ├── controllers/                  # Request Handlers
│   │   ├── authController.js        # Login, register, auth endpoints
│   │   ├── taskController.js        # Task CRUD & management
│   │   ├── documentController.js    # Document request & processing
│   │   └── notificationController.js # Notification management
│   │
│   ├── middleware/                   # Express Middleware
│   │   ├── authMiddleware.js        # JWT authentication check
│   │   ├── roleMiddleware.js        # Role-based access control
│   │   ├── errorHandler.js          # Global error handling
│   │   └── validationMiddleware.js  # Input validation functions
│   │
│   ├── routes/                       # API Route Definitions
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── taskRoutes.js            # /api/tasks endpoints
│   │   ├── documentRoutes.js        # /api/documents endpoints
│   │   └── notificationRoutes.js    # /api/notifications endpoints
│   │
│   ├── services/                     # Business Logic
│   │   ├── taskService.js           # Task management logic
│   │   ├── documentService.js       # Document processing logic
│   │   └── notificationService.js   # Notification system
│   │
│   ├── utils/                        # Utility Functions
│   │   ├── logger.js                # Structured logging
│   │   └── fileUpload.js            # Multer file upload config
│   │
│   └── uploads/                      # PDF file storage
│
├── mon-portail-administratif/       # REACT FRONTEND
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── public/
│   │   └── index.html              # HTML entry point
│   │
│   └── src/
│       ├── index.js                # React root
│       ├── App.jsx                 # Main app component with routing
│       ├── Layout.jsx              # Header/layout component
│       ├── api.js                  # API client (all endpoints)
│       ├── globals.css             # Global styles
│       ├── index.css               # Tailwind styles
│       │
│       ├── contexts/               # React Contexts
│       └── AuthContext.jsx         # Authentication context
│       │
│       ├── components/             # Reusable Components
│       │   ├── LanguageContext.jsx # Language/i18n context
│       │   └── ui/                 # UI Components
│       │       ├── button.jsx      # Button component
│       │       ├── input.jsx       # Input component
│       │       ├── label.jsx       # Label component
│       │       ├── card.jsx        # Card component
│       │       ├── textarea.jsx    # Textarea component
│       │       ├── select.jsx      # Select component
│       │       ├── skeleton.jsx    # Skeleton loader
│       │       ├── StatusBadge.jsx # Status badge
│       │       ├── LanguageToggle.jsx # Language switcher
│       │       └── DocumentCard.jsx   # Document card
│       │
│       └── pages/                  # Page Components
│           ├── LoginPage.jsx       # Login page
│           ├── RegisterPage.jsx    # Registration page
│           ├── Home.jsx            # Home/dashboard
│           ├── NewRequest.jsx      # New task/request form
│           ├── MyRequests.jsx      # User's tasks list
│           ├── RequestDetails.jsx  # Task/request details
│           ├── AdminDashboard.jsx  # Admin panel
│           └── AdminRequestDetail.jsx # Admin task detail
```

## File Purposes & Key Relationships

### Backend Architecture

#### models/
- **user.js**: User account with role (admin/employee), password hashing
- **Task.js**: Tasks created by admin, assigned to employees
- **Document.js**: Document requests from employees, processed by admin
- **Notification.js**: Notifications triggered by task/document changes
- **index.js**: Registers all models and associations

#### routes/
- **authRoutes.js** → authController.js → User model
- **taskRoutes.js** → taskController.js → taskService.js → Task model
- **documentRoutes.js** → documentController.js → documentService.js → Document model
- **notificationRoutes.js** → notificationController.js → Notification model

#### middleware/
- authMiddleware.js: Validates JWT on every protected request
- roleMiddleware.js: Checks user role for admin routes
- errorHandler.js: Catches all errors and returns formatted response
- validationMiddleware.js: Input validation functions

#### services/
- taskService.js: Business logic for task operations
- documentService.js: Business logic for document operations
- notificationService.js: Business logic for notification operations

### Frontend Architecture

#### Contexts
- **AuthContext.jsx**: Manages user authentication state, login/logout, token storage

#### Pages
- **LoginPage.jsx**: Authentication form
- **RegisterPage.jsx**: User registration
- **Home.jsx**: Dashboard for authenticated users
- **MyRequests.jsx**: User's assigned tasks/documents
- **AdminDashboard.jsx**: Admin panel with all tasks/documents
- **AdminRequestDetail.jsx**: Admin view of specific task/document

#### API Integration
- **api.js**: Centralized API client with all endpoint functions
- Automatically handles token from localStorage
- Auto-redirects to login on 401


## Entity Relationships

```
User (1) ───┬─── (Many) Task
            │       - created tasks (createdByUserId)
            │       - assigned tasks (assignedUserId)
            ├─── (Many) Document
            │       - requested documents (userId)
            │       - processed documents (processedByUserId)
            └─── (Many) Notification
                    - user notifications (userId)

Task (1) ───┬─── (1) User (creator)
            └─── (1) User (assignee)

Document (1) ───┬─── (1) User (requestor)
                └─── (1) User (processor)
```

## Key Features Implementation

### 1. Authentication
- **Files**: authController.js, authMiddleware.js, user.js
- **Flow**: Login → JWT Token → localStorage → Auth header on requests
- **Security**: bcryptjs hashing, JWT expiration, token validation

### 2. Role-Based Access (RBAC)
- **Files**: roleMiddleware.js, routes (requireAdmin)
- **Roles**: admin (full access), employee (limited access)
- **Enforcement**: All routes check req.user.role

### 3. Task Management
- **Files**: Task.js, taskService.js, taskController.js, taskRoutes.js
- **Workflow**: Admin creates task → Assigns to employee → Employee updates status
- **Notifications**: New task assignment triggers notification

### 4. Document Processing
- **Files**: Document.js, documentService.js, documentController.js
- **Workflow**: Employee requests → Admin reviews → Admin uploads PDF → Employee downloads
- **File Upload**: Multer middleware, PDF only, secure storage

### 5. Notifications
- **Files**: Notification.js, notificationService.js
- **Triggers**: Task assignment, document status changes
- **Features**: Mark read/unread, delete, get unread count

## Database Flow

```
User Registration
└─> User.create() in authController.js
    └─> beforeCreate hook (bcrypt password)
    └─> Stored in users table

Task Creation (Admin)
└─> Task.create() in taskService.js
    └─> Notification.create() if assigned
    └─> Stored in tasks table

Document Request (Employee)
└─> Document.create() in documentService.js
    └─> Stored in documents table

Document Upload (Admin)
└─> Document.update() with filePath
    └─> File stored in /uploads
    └─> Notification sent to user
```

## API Flow Example

### Login Flow
```
Frontend (LoginPage.jsx)
  ↓ POST /api/auth/login
Backend (authController.js)
  ↓ validate email, check password
Backend (User model)
  ↓ query database
Database
  ↓ return user data
Backend (authController.js)
  ↓ generate JWT token
Frontend (AuthContext.jsx)
  ↓ store token + user in localStorage
Frontend (App.jsx)
  ↓ redirect to home
```

### Create Task Flow
```
Frontend (NewRequest.jsx)
  ↓ POST /api/tasks with auth header
Backend (taskController.js)
  ↓ check role (requireAdmin)
Backend (taskService.js)
  ↓ create task + notification
Backend (models)
  ↓ save to database
Database
  ↓ confirm saved
Frontend (MyRequests.jsx)
  ↓ fetch tasks GET /api/tasks/my
  ↓ display in list
```

## Configuration Files

### Environment Variables (.env)
```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME    # Database
JWT_SECRET, JWT_EXPIRE                     # Authentication
BCRYPT_ROUNDS                              # Security
MAX_FILE_SIZE, UPLOAD_DIR                  # File uploads
NODE_ENV, PORT                             # Server
```

### Tailwind (Frontend)
- Utility-first CSS framework
- Configured in tailwind.config.js

### Sequelize (Backend)
- ORM for MySQL
- Configured in config/database.js
- Models in models/

## Testing Checklist

- [ ] Copy backend/.env.example to backend/.env
- [ ] Edit .env with MySQL credentials
- [ ] Run `npm install:all`
- [ ] Run `npm run init-db`
- [ ] Run `npm run backend:dev` (Terminal 1)
- [ ] Run `npm run frontend` (Terminal 2)
- [ ] Login with admin@wathiqati.com / password123
- [ ] Create task as admin
- [ ] Assign to employee
- [ ] Login as employee, view task
- [ ] Request document as employee
- [ ] Upload document as admin
- [ ] Download as employee

## Performance Considerations

- Database indexes on userId, role, status
- JWT caching in localStorage
- File upload size limit (5MB)
- Notification pagination
- Task filtering by status

## Security Features

1. **Password Security**: bcryptjs with 10 rounds
2. **Token Security**: JWT with expiration
3. **Authorization**: Role checks on routes
4. **Input Validation**: Server-side validation
5. **File Security**: PDF only, size limit, secure path
6. **Error Handling**: No sensitive info in responses

---

**This is a complete, production-ready application ready to run immediately after database setup.**
