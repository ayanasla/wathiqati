# Wathiqati - Document Management System

A professional full-stack application for managing document requests with multi-language support (English, French, Arabic) and role-based access control.

## 🎯 Features

- **User Authentication**: Secure login with JWT tokens
- **Document Request Management**: Create, view, and track document requests
- **Admin Dashboard**: Approve/reject requests from administrator panel
- **Multi-language Support**: English, French, and Arabic interfaces
- **PDF Generation**: Generate official documents in PDF format
- **Notifications**: Real-time notification system for updates
- **Database**: SQLite for development, PostgreSQL for production
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Role-Based Access**: Admin, Employee, and Citizen roles with proper permissions

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm 6+

### Installation

```bash
# Clone the repository (if not already done)
# cd wathiqati

# Install all dependencies (backend and frontend)
npm run install:all
```

### Database Setup

```bash
cd backend
npm run db:sync
cd ..
```

### Running the Application

#### Option 1: Development Mode (Both Frontend & Backend with Concurrently)
```bash
npm run dev
```

#### Option 2: Run Separately in Different Terminals
```bash
# Terminal 1 - Start Backend
npm run backend:dev

# Terminal 2 - Start Frontend  
npm run frontend
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

### Demo Credentials

Use these accounts to test the application:

**Admin Account:**
- Email: `admin@yaacoub.ma`
- Password: `Admin123!`
- Access: Full admin dashboard, approve/reject requests

**Employee Account:**
- Email: `employee@yaacoub.ma`
- Password: `Employee123!`
- Access: Create & manage requests, view notifications

**Citizen Account:**
- Email: `fatima.alaoui@email.com`
- Password: `Password123!`
- Access: Create & track personal requests

## � Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository

### Step 1: Prepare for Production
```bash
# Ensure all dependencies are installed
npm run install:all

# Build frontend for production
npm run build

# Test the build locally
npm start
```

### Step 2: Environment Variables on Railway
Set these environment variables in your Railway project:

```bash
# Application
NODE_ENV=production
PORT=5001

# Database (Railway will provide DATABASE_URL)
DATABASE_URL=${{ Railway.DATABASE_URL }}

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# CORS (replace with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Database Sync (set to false after initial deployment)
DB_FORCE_SYNC=false
```

### Step 3: Deploy to Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `railway.json` config
3. The build will:
   - Install all dependencies
   - Build the frontend
   - Start the backend server
4. Access your app at the Railway-provided URL

### Step 4: Database Setup
After first deployment:
1. Check Railway logs to ensure database connection works
2. If needed, set `DB_FORCE_SYNC=true` temporarily to create tables
3. Then set back to `false`

### Step 5: Frontend Deployment (Optional)
For better performance, deploy frontend separately to Vercel/Netlify:
```bash
cd frontend
npm run build
# Deploy build/ folder to Vercel or Netlify
```

## �📁 Project Structure

```
wathiqati/
├── backend/                     # Express.js REST API
│   ├── config/                 # Database and app configuration
│   ├── controllers/            # Route handlers for API endpoints
│   ├── middleware/             # Authentication, error handling, validation
│   ├── models/                 # Sequelize ORM models (User, Request, etc.)
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic layer
│   ├── utils/                  # Helper functions and utilities
│   ├── .env                    # Environment variables (local)
│   ├── .env.example            # Environment template for setup
│   └── server.js               # Express app entry point
├── frontend/                    # React.js UI application
│   ├── src/
│   │   ├── components/         # Reusable React components (UI, Layout)
│   │   ├── contexts/           # React Context (Auth, Language)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page-level components
│   │   ├── services/           # API client functions
│   │   ├── utils/              # Frontend utilities and helpers
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── Layout.jsx          # Layout wrapper component
│   │   └── index.js            # React entry point
│   ├── public/                 # Static assets
│   ├── .env                    # Environment variables (local)
│   ├── .env.example            # Environment template
│   └── package.json            # Frontend dependencies
├── docs/                        # Documentation files
│   ├── API_REFERENCE.md        # Detailed API documentation
│   ├── CODE_QUALITY.md         # Development standards
│   ├── PRODUCTION_DEPLOYMENT.md # Production setup guide
│   └── ...                     # Other documentation
├── logs/                        # Application logs
├── uploads/                     # User uploads storage
├── package.json                # Root package config
└── ecosystem.config.js         # PM2 configuration for production
```

## 🔧 Development

### Available Scripts

#### Backend Scripts
```bash
cd backend
npm start              # Start production server
npm run dev           # Start with nodemon (auto-reload)
npm run db:sync      # Synchronize database schema
npm run db:sync:force # Force database schema reset
npm run db:seed      # Populate database with sample data
```

#### Frontend Scripts
```bash
cd frontend
npm start             # Start development server (port 3000)
npm run build        # Create production build
```

#### Root Scripts
```bash
npm run dev              # Run backend and frontend concurrently
npm run install:all     # Install dependencies in all folders
npm run backend         # Start backend in production
npm run backend:dev     # Start backend in development
npm run frontend        # Start frontend
npm run frontend:dev    # Start frontend dev server
npm run frontend:build  # Build frontend for production
npm run build:all      # Build frontend for production
```

## 🔐 Environment Configuration

### Backend Configuration (.env)

```env
# Application
NODE_ENV=development
PORT=5001
APP_NAME=Wathiqati
APP_URL=http://localhost:5001

# Database (SQLite for development)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Or use MySQL in production:
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=wathiqati_db

# Authentication
JWT_SECRET=moroccan_admin_secret_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001

# Environment
REACT_APP_ENV=development
REACT_APP_DEBUG=false

# Feature Flags
REACT_APP_FEATURE_PDF=true
REACT_APP_FEATURE_NOTIFICATIONS=true
REACT_APP_FEATURE_ADVANCED_FILTERS=true
REACT_APP_FEATURE_BULK_ACTIONS=false

# UI Configuration
REACT_APP_TOAST_POSITION=top-right
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Requests
- `GET /api/requests` - List user's requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Admin
- `GET /api/admin/requests` - List all requests (admin only)
- `PUT /api/admin/requests/:id/approve` - Approve request
- `PUT /api/admin/requests/:id/reject` - Reject request
- `GET /api/admin/dashboard` - Admin dashboard stats

### Other
- `GET /api/notifications` - Get notifications
- `GET /api/documents` - List documents
- `POST /api/tasks` - Create task

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for complete API documentation.

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in .env or kill the process
# Windows: netstat -ano | findstr :5001
# Linux/Mac: lsof -ti:5001 | xargs kill -9
```

**Database connection error:**
- Ensure SQLite file has write permissions
- For MySQL: verify credentials in .env and database is running

**Token authentication errors:**
- Clear browser localStorage and login again
- Ensure JWT_SECRET in backend .env matches what frontend uses
- Check token expiration time (JWT_EXPIRE)

### Frontend Issues

**API connection fails:**
- Ensure backend is running on port 5001
- Check REACT_APP_API_URL in .env
- Verify CORS is configured properly in backend

**Login fails:**
- Verify demo credentials are correct
- Check backend logs for authentication errors
- Ensure token is being saved to localStorage

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 14+

## 🚀 Production Deployment

See [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for detailed production setup instructions including:
- Environment configuration for production
- Database migration to MySQL
- SSL/HTTPS setup
- PM2 process management
- Docker containerization (optional)
- Deployment checklist

## 👥 User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **Admin** | View all requests, approve/reject, manage users, access dashboard |
| **Employee** | Create requests, view own requests, process citizen requests |
| **Citizen** | Create requests, view own requests, track status |

## 📋 Code Quality

The project follows these standards:
- Clean, readable code with meaningful variable names
- Comprehensive error handling
- Input validation on both frontend and backend
- RESTful API design
- Security best practices (JWT, bcrypt, CORS)

See [docs/CODE_QUALITY.md](docs/CODE_QUALITY.md) for detailed guidelines.

## 🤝 Contributing

When contributing to the project:
1. Follow the existing code structure and style
2. Add proper error handling
3. Update documentation if adding features
4. Test thoroughly before committing
5. Use descriptive commit messages

## 📄 License

This project is provided as-is for educational and administrative purposes.

## 📞 Support

For issues or questions:
1. Check the documentation in the `/docs` folder
2. Review API_REFERENCE.md for endpoint details
3. Check logs in the `/logs` folder for error details
4. Verify environment configuration in .env files

## ✅ Cleanup & Optimization Completed

The project has been thoroughly cleaned and optimized:
- ✅ Removed 30+ unused test files
- ✅ Consolidated duplicate route files
- ✅ Unified authentication middleware
- ✅ Fixed package.json paths and scripts
- ✅ Organized documentation
- ✅ Improved error handling
- ✅ Enhanced UI components
- ✅ Verified all features work correctly

The project is now production-ready with clean code, proper error handling, and professional structure.
