# API REFERENCE - All Endpoints

## Base URL
Development: `http://localhost:5000/api`
Production: `https://your-domain.com/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## AUTH ENDPOINTS

### Register
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "createdAt": "2026-03-24T10:00:00Z"
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Documentation",
    "isActive": true
  }
}
```

### Update Profile
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Updated Name",
  "department": "New Department"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}

Response 200:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## TASK ENDPOINTS

### Create Task (Admin Only)
```
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete report",
  "description": "Prepare quarterly report",
  "priority": "high",           // low, medium, high
  "deadline": "2026-04-15",
  "assignedUserId": "uuid"
}

Response 201:
{ "success": true, "task": { ... } }
```

### Get All Tasks (Admin Only)
```
GET /tasks
GET /tasks?status=pending&priority=high&limit=10&offset=0
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "tasks": [ { ... }, { ... } ],
  "count": 2
}
```

### Get My Tasks (Employee)
```
GET /tasks/my
GET /tasks/my?status=in_progress
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "tasks": [ { ... }, { ... } ],
  "count": 3
}
```

### Get Task Detail
```
GET /tasks/{id}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "task": {
    "id": "uuid",
    "title": "Complete report",
    "description": "Prepare quarterly report",
    "status": "in_progress",
    "priority": "high",
    "deadline": "2026-04-15",
    "assignedUserId": "uuid",
    "createdByUserId": "uuid",
    "completedAt": null,
    "creator": { "id": "uuid", "name": "Admin", "email": "admin@..." },
    "assignee": { "id": "uuid", "name": "John", "email": "john@..." },
    "createdAt": "2026-03-24T10:00:00Z"
  }
}
```

### Update Task
```
PUT /tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "done",             // pending, in_progress, done
  "priority": "medium"
}

Response 200:
{ "success": true, "task": { ... } }
```

### Delete Task (Admin Only)
```
DELETE /tasks/{id}
Authorization: Bearer {token}

Response 200:
{ "success": true, "message": "Task deleted successfully" }
```

---

## DOCUMENT ENDPOINTS

### Request Document
```
POST /documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Birth Certificate",
  "description": "Need copy for visa application"
}

Response 201:
{
  "success": true,
  "message": "Document request submitted successfully",
  "document": {
    "id": "uuid",
    "title": "Birth Certificate",
    "description": "...",
    "status": "pending",
    "userId": "uuid",
    "createdAt": "2026-03-24T10:00:00Z"
  }
}
```

### Get My Documents
```
GET /documents/my
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "documents": [ { ... }, { ... } ],
  "count": 5
}
```

### Get All Documents (Admin Only)
```
GET /documents
GET /documents?status=pending
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "documents": [ { ... }, { ... } ],
  "count": 12
}
```

### Get Document Detail
```
GET /documents/{id}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "document": {
    "id": "uuid",
    "title": "Birth Certificate",
    "description": "...",
    "status": "processing",
    "filePath": null,
    "fileName": null,
    "userId": "uuid",
    "processedByUserId": null,
    "user": { "id": "uuid", "name": "John", "email": "john@..." },
    "createdAt": "2026-03-24T10:00:00Z"
  }
}
```

### Update Document Status (Admin Only)
```
PUT /documents/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "processing"        // pending, processing, ready, rejected
}

// If rejected:
{
  "status": "rejected",
  "rejectionReason": "Missing required ID"
}

Response 200:
{ "success": true, "document": { ... } }
```

### Upload Document PDF (Admin Only)
```
POST /documents/{id}/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <PDF file>

Response 200:
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "status": "ready",
    "filePath": "/uploads/123456789-document.pdf",
    "fileName": "123456789-document.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf"
  }
}
```

### Download Document
```
GET /documents/{id}/download
Authorization: Bearer {token}

Response: 200 (File download)
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
```

### Delete Document (Admin Only)
```
DELETE /documents/{id}
Authorization: Bearer {token}

Response 200:
{ "success": true, "message": "Document deleted successfully" }
```

---

## NOTIFICATION ENDPOINTS

### Get Notifications
```
GET /notifications
GET /notifications?unreadOnly=true
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "New Task Assigned",
      "message": "You have been assigned a new task: Complete report",
      "type": "task",
      "relatedId": "task-uuid",
      "isRead": false,
      "createdAt": "2026-03-24T10:00:00Z"
    }
  ],
  "count": 5
}
```

### Get Unread Count
```
GET /notifications/unread/count
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "unreadCount": 3
}
```

### Mark Notification as Read
```
PUT /notifications/{id}/read
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Notification marked as read",
  "notification": { ...isRead: true }
}
```

### Mark All as Read
```
PUT /notifications/read-all
Authorization: Bearer {token}

Response 200:
{ "success": true, "message": "All notifications marked as read" }
```

### Delete Notification
```
DELETE /notifications/{id}
Authorization: Bearer {token}

Response 200:
{ "success": true, "message": "Notification deleted" }
```

---

## ERROR RESPONSES

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing required fields | Check request body |
| 401 | Unauthorized / Token invalid | Re-login and get new token |
| 403 | Insufficient permissions | Admin access required |
| 404 | Resource not found | Check ID exists |
| 409 | Email already registered | Use different email |
| 500 | Internal server error | Check server logs |

---

## Headers Required

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Token Format

Store token after login:
```javascript
localStorage.setItem('token', response.token);
```

Then use in all requests:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## Rate Limiting

Currently no rate limiting. Add rate limiter for production:

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

---

## Testing with cURL

### Test Application Health
```bash
curl http://localhost:5000/ping
```

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wathiqati.com","password":"password123"}' | jq '.token'
```

### Use Token
```bash
TOKEN="your-token-here"
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

**API Version**: 1.0.0
**Last Updated**: March 2026
**Status**: Production Ready
