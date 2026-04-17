# Moroccan Administrative Document Backend

A Node.js backend API for a Moroccan administrative document request platform where citizens can submit document requests and municipal administrations process them.

## Features

### 👤 User Features
- User registration and authentication
- Submit document requests (birth certificates, ID cards, residence certificates, etc.)
- View request status and history
- Download approved documents (PDF)

### 🏢 Admin Features
- Secure admin login
- View requests from their municipality only
- Approve or reject requests
- Generate official PDF documents for approved requests
- Municipality-based access control

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **PDF Generation**: PDFKit
- **Password Hashing**: bcryptjs

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── userController.js
│   └── adminController.js
├── middleware/           # Custom middleware
│   └── auth.js
├── models/              # Sequelize models
│   ├── index.js
│   ├── user.js
│   └── request.js
├── routes/              # API routes
│   ├── auth.js
│   ├── user.js
│   └── admin.js
├── scripts/             # Utility scripts
│   └── init-db.js
├── config/              # Configuration files
│   └── database.js
├── uploads/             # File uploads directory
├── .env                 # Environment variables
├── server.js            # Main application file
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env` file and configure your database settings:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=moroccan_admin_db
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   - Create a MySQL database named `moroccan_admin_db`
   - Run the initialization script:
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5001`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile (protected)

### User Routes (`/api/user`) - Protected
- `POST /api/user/requests` - Create new document request
- `GET /api/user/requests` - Get user's requests with pagination
- `GET /api/user/requests/:id` - Get specific request details

### Admin Routes (`/api/admin`) - Admin Only
- `GET /api/admin/requests` - Get requests for admin's municipality
- `PUT /api/admin/requests/:id/approve` - Approve a request
- `PUT /api/admin/requests/:id/reject` - Reject a request

## Database Models

### User Model
```javascript
{
  id: UUID,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ('user', 'admin'),
  municipality: String (admin only),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Request Model
```javascript
{
  id: UUID,
  userId: UUID (foreign key),
  documentType: String,
  status: Enum ('pending', 'approved', 'rejected'),
  municipality: String,
  description: String,
  rejectionReason: String,
  pdfUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Different permissions for users and admins
- **Municipality Isolation**: Admins can only access their municipality's requests
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured CORS settings

## Demo Data

After running `npm run init-db`, the following demo accounts are created:

**Admin Account:**
- Email: `admin@yaacoub.ma`
- Password: `Admin123!`
- Municipality: `Yaacoub El Mansour`

**User Accounts:**
- Email: `fatima.alaoui@email.com`
- Password: `Password123!`

- Email: `mohammed.tazi@email.com`
- Password: `Password123!`

## Usage Examples

### User Registration
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Create Document Request (Authenticated)
```bash
curl -X POST http://localhost:5001/api/user/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "documentType": "Birth Certificate",
    "municipality": "Yaacoub El Mansour",
    "description": "Request for birth certificate copy"
  }'
```

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database with demo data

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5001)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.