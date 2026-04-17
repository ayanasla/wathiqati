# QUICKSTART - Get Wathiqati Running in 5 Minutes

## 🚀 Quick Installation & Run

### Step 1: Install Dependencies (2 min)
```bash
npm run install:all
```

### Step 2: Initialize Database (1 min)
```bash
cd backend
npm run db:sync
cd ..
```

### Step 3: Start Application (1 min)
```bash
npm run dev
```

### Step 4: Open in Browser (1 min)
- Go to: **http://localhost:3000**
- Click Login
- Use credentials below

---

## 👤 Demo Credentials

### Admin User (Full Access)
```
Email: admin@yaacoub.ma
Password: Admin123!
```
Access: All features, request approval/rejection, dashboard

### Employee 
```
Email: employee@yaacoub.ma
Password: Employee123!
```
Access: Create and manage requests

### Citizen
```
Email: fatima.alaoui@email.com
Password: Password123!
```
Access: Create and track personal requests

---

## 🎯 What to Test

After logging in, try these features:

1. **Create Request**
   - Navigate to "New Request"
   - Fill in document type and personal info
   - Click Create Request

2. **View Requests**
   - Go to "My Requests"
   - See all your requests
   - Track status (Pending, Approved, etc.)

3. **Admin Dashboard** (Admin only)
   - Switch to admin role
   - View all requests from all users
   - Approve or reject requests
   - Add admin notes

4. **Notifications**
   - Check bell icon (top right)
   - Get notified of status changes

---

## 📱 Key Features

✅ Multi-language (English/French/Arabic)  
✅ JWT Authentication with token validation  
✅ PDF Document Generation  
✅ Admin Approval Workflow  
✅ Real-time Notifications  
✅ Role-based Access Control (Admin/Employee/Citizen)  
✅ Request status tracking  
✅ Comprehensive error handling  

---

## 🔧 Troubleshooting

**Port 3000 or 5001 in use?**
```bash
# Windows - Check what's using the port
netstat -ano | findstr :3000

# Windows - Kill the process
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Database connection error?**
- Delete `backend/database.sqlite`
- Run `cd backend && npm run db:sync` again

**Login doesn't work?**
- Clear browser cache: Ctrl+Shift+Delete
- Try incognito/private mode
- Check browser console (F12) for errors
- Verify backend is running on port 5001

**API errors (401, 403)?**
- Token might be expired - log out and log in again
- Verify you're using correct credentials
- Check that /api prefix is correct in frontend .env

---

## 📂 Project Files

```
wathiqati/
├── README.md                 # Full documentation
├── CLEANUP_SUMMARY.md        # What was cleaned up
├── QUICKSTART.md             # This file
├── backend/                  # Express.js API server
│   ├── server.js            # Main entry
│   ├── .env                 # Configuration
│   └── [config, models, routes, etc.]
├── frontend/                # React web app
│   ├── src/App.jsx         # Main React component
│   ├── .env                # Configuration
│   └── [components, pages, etc.]
└── docs/                    # Documentation
    ├── API_REFERENCE.md    # All API endpoints
    ├── CODE_QUALITY.md     # Development standards
    └── [other guides]
```

---

## 📚 More Information

- **Full Documentation**: [README.md](README.md) - Comprehensive guide
- **API Reference**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - All endpoints
- **Cleanup Summary**: [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - What was improved
- **Code Quality**: [docs/CODE_QUALITY.md](docs/CODE_QUALITY.md) - Development standards
- **Production Deployment**: [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

---

## 🎉 All Set!

The project has been completely optimized:
- ✅ **Cleaned**: 40+ unnecessary files removed
- ✅ **Fixed**: All errors resolved (401, API issues, etc.)
- ✅ **Organized**: Professional folder structure
- ✅ **Enhanced**: UI improved with better components
- ✅ **Documented**: Comprehensive guides added

Your document management system is ready to use!

---

## ❓ Still Having Issues?

1. Check [README.md](README.md) - Comprehensive troubleshooting section
2. Review [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - See what was changed
3. Check server logs: `backend/logs/` folder
4. Verify environment variables in `.env` files
5. Ensure Node.js 14+ is installed: `node --version`

**Happy coding! 🚀**
# Edit backend/.env with your MySQL credentials

# Initialize database and create demo users
npm run init-db
```

### 3. Start Backend Server

```bash
# Terminal 1: Backend (port 5000)
npm run backend:dev
```

You should see:
```
Server listening on port 5000
Database connection established
```

### 4. Start Frontend Server

```bash
# Terminal 2: Frontend (port 3000)
npm run frontend
```

Wait for browser to open at http://localhost:3000

## Login with Demo Accounts

### Admin Account
- Email: `admin@yaacoub.ma`
- Password: `Admin123!`
- Access: Full system access for Yaacoub El Mansour municipality

### Regular Users
- Email: `fatima.alaoui@email.com`
- Password: `Password123!`
- Access: Can create document requests

- Email: `mohammed.tazi@email.com`
- Password: `Password123!`
- Access: Can create document requests

## What You Can Do

### As Employee
1. View assigned tasks
2. Update task status
3. Request new documents
4. View document status
5. Download completed documents
6. Check notifications

### As Admin
1. Create and assign tasks
2. Update task status
3. View all requests
4. Process documents
5. Upload PDFs
6. Manage users

## File Locations

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **API Docs**: Check `/api/...` endpoints
- **Uploads**: `backend/uploads/`

## Key Files to Edit

- `.env` - Database and JWT settings
- `backend/server.js` - Server configuration
- `mon-portail-administratif/src/App.jsx` - Frontend routing

## Common Issues

### "Database connection failed"
- Ensure MySQL is running
- Check .env credentials
- Run: `npm run init-db`

### "Port already in use"
- Backend: Change PORT in .env
- Frontend: Kill process on port 3000

### "npm install fails"
- Delete node_modules: `rm -rf node_modules`
- Clear cache: `npm cache clean --force`
- Reinstall: `npm install`

## API Testing

### Test Backend Endpoint

```bash
curl http://localhost:5000/ping
```

Should return: `{"success": true, "message": "Server is running"}`

### Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wathiqati.com",
    "password": "password123"
  }'
```

Returns JWT token for authenticated requests.

## Next Steps

1. ✅ Application is running
2. 📖 Read README.md for full documentation
3. 🚀 Check DEPLOYMENT.md for production setup
4. 💻 Start developing!

## Useful Commands

```bash
# Backend only
cd backend
npm start          # Production mode
npm run dev        # Development with reload
npm run init-db    # Reset database

# Frontend only
cd mon-portail-administratif
npm start          # Start dev server
npm run build      # Build for production

# Both servers
npm run backend:dev    # Terminal 1
npm run frontend       # Terminal 2
```

## Production Deployment

When ready to deploy:

1. Read DEPLOYMENT.md
2. Configure .env for production
3. Build frontend: `npm run build:all`
4. Deploy to Render, Vercel, or your hosting

## Getting Help

- Check README.md for detailed documentation
- Review API endpoints in README.md
- Check backend logs: `backend/server.js`
- Check frontend console: Browser DevTools (F12)

---

**Have fun building!** 🚀
