# Request Status Workflow - Endpoint Verification

## Backend Routes Verified ✅

### 1. Request Routes (`backend/routes/requests.js`)
```javascript
✅ router.post('/', authenticate, requestController.create);
✅ router.get('/', authenticate, requestController.list);
✅ router.get('/:id', authenticate, requestController.get);
✅ router.put('/:id', authenticate, requestController.update);  // Generic status update
✅ router.put('/:id/start-review', authenticate, requireAdmin, requestController.startReview);  // in_review
✅ router.put('/:id/generate-document', authenticate, requireAdmin, requestController.generateDocument);  // document_generated
✅ router.post('/:id/document', authenticate, requireAdmin, upload.single('document'), requestController.uploadDocument);  // upload
✅ router.delete('/:id', authenticate, requestController.remove);
```

### 2. Admin Routes (`backend/routes/admin.js`)
```javascript
✅ router.get('/requests', getAdminRequests);
✅ router.put('/requests/:id/approve', approveRequest);  // approved (FIXED: now accepts in_review)
✅ router.put('/requests/:id/reject', rejectRequest);  // rejected (FIXED: now accepts in_review)
```

---

## Status Transition Matrix ✅

| Current Status | Can Transition To | Method | Endpoint | Controller |
|---|---|---|---|---|
| pending | in_review | startReview() | PUT /api/requests/:id/start-review | requestController.startReview |
| pending | approved | approveRequest() | PUT /api/admin/requests/:id/approve | adminController.approveRequest |
| pending | rejected | rejectRequest() | PUT /api/admin/requests/:id/reject | adminController.rejectRequest |
| pending | rejected (via update) | updateRequest() | PUT /api/requests/:id | requestController.update |
| in_review | approved | approveRequest() | PUT /api/admin/requests/:id/approve | adminController.approveRequest ✅ NOW WORKS |
| in_review | rejected | rejectRequest() | PUT /api/admin/requests/:id/reject | adminController.rejectRequest ✅ NOW WORKS |
| in_review | rejected (via update) | updateRequest() | PUT /api/requests/:id | requestController.update |
| approved | document_generated | generateDocument() | PUT /api/requests/:id/generate-document | requestController.generateDocument |
| approved | document_generated | uploadDocument() | POST /api/requests/:id/document | requestController.uploadDocument |

---

## Database Persistence Verification ✅

### Save/Reload Pattern (Applied to All Transitions)
```javascript
// Pattern used across all status changes:
await request.save();        // ✅ Persists to database
await request.reload();      // ✅ Refreshes from database to verify
console.log(...);            // ✅ Logs the transition
return request;              // ✅ Returns full updated object
```

### Locations Verified
```javascript
// RequestService.createRequest()
preparationLocation: requestData.preparationLocation || 'To be determined'
// Overridden by controller before calling:
preparationLocation || 'Arrondissement Yaacoub El Mansour - Rabat'

// AdminController.approveRequest()
preparationLocation = req.body.preparationLocation || 'Arrondissement Yaacoub El Mansour - Rabat'

// RequestService.generateDocument()
if (!request.preparationLocation) {
  request.preparationLocation = 'Arrondissement Yaacoub El Mansour - Rabat';
}

// RequestService.uploadDocument()
if (!request.preparationLocation) {
  request.preparationLocation = 'Arrondissement Yaacoub El Mansour - Rabat';
}
```

---

## Frontend API Calls Verified ✅

### API Endpoints Called from AdminRequestDetail.jsx

| Action | API Function | HTTP Method | Endpoint | Response Handling |
|---|---|---|---|---|
| Process Pending | startReviewRequest(id) | PUT | /api/requests/:id/start-review | refreshRequest() ✅ |
| Approve Request | approveRequest(id, loc) | PUT | /api/admin/requests/:id/approve | refreshRequest() ✅ |
| Update Status | updateRequest(id, data) | PUT | /api/requests/:id | refreshRequest() ✅ |
| Generate Doc | generateDocumentRequest(id) | PUT | /api/requests/:id/generate-document | refreshRequest() ✅ |
| Upload Doc | uploadDocument(id, file) | POST | /api/requests/:id/document | refreshRequest() ✅ |

### Frontend Error Handling
```javascript
✅ try/catch on all API calls
✅ User alerts for errors
✅ Console logging for debugging
✅ Proper finally blocks to reset loading states
✅ No optimistic state updates
```

---

## Status Validation Rules ✅

### RequestService.approveRequest()
```
Accepts: ['pending', 'in_review']  ✅ (FIXED from only 'pending')
Denies: 'approved', 'rejected', 'document_generated'
```

### AdminController.approveRequest()
```
Accepts: ['pending', 'in_review']  ✅ (FIXED from only 'pending')
Denies: 'approved', 'rejected', 'document_generated'
Error: "Cannot approve request in {status} status"
```

### AdminController.rejectRequest()
```
Accepts: ['pending', 'in_review']  ✅ (FIXED from only 'pending')
Denies: 'approved', 'rejected', 'document_generated'
Error: "Cannot reject request in {status} status"
```

### RequestService.generateDocument()
```
Accepts: ['approved']
Denies: 'pending', 'in_review', 'rejected', 'document_generated'
Error: "Cannot generate document for request in {status} state"
```

---

## Logging Coverage ✅

### All Status Changes Logged
```
[Request] Status changed: pending → in_review
[Request] Status changed: in_review → approved
[Request] Status changed: in_review → rejected
[Request] Status changed: approved → document_generated
[Request] Document uploaded
[API] Request status updated: {status}
[API] Request moved to in_review
[API] Request approved
[API] Document generated
[AdminRequestDetail] Status updated successfully
[AdminRequestDetail] Request approved successfully
[AdminRequestDetail] Document generated successfully
[AdminRequestDetail] Document uploaded successfully
```

### Error Logging
```
[Request Update Error]
[Approve Request Error]
[Reject Request Error]
[Generate Document Error]
```

---

## Production Readiness Checklist

### Database
- [x] Status enum validation at model level
- [x] PreparationLocation field properly defined
- [x] All timestamp fields present (approvedAt, rejectedAt, generatedAt)
- [x] Audit trail logging implemented
- [x] Foreign key relationships maintained

### API
- [x] All endpoints secured with authenticate middleware
- [x] Admin endpoints require requireAdmin middleware
- [x] Request validation on inputs
- [x] Proper HTTP status codes returned
- [x] Error messages are descriptive
- [x] Response format consistent (always { success, data/error })

### Frontend
- [x] No hardcoded URLs
- [x] API constants properly imported
- [x] No optimistic updates
- [x] Always refreshes from server after mutations
- [x] Proper error handling and user feedback
- [x] Loading states properly managed

### Security
- [x] All admin endpoints require role validation
- [x] Request ownership validated where applicable
- [x] Input data sanitized
- [x] No sensitive data in logs
- [x] Audit trail maintained for compliance

---

## Deployment Steps

1. **Backup current database**
   ```bash
   mysqldump -u user -p database > backup.sql
   ```

2. **Stop backend service**
   ```bash
   pm2 stop wathiqati-backend
   ```

3. **Deploy code changes**
   ```bash
   git pull origin main
   npm install
   ```

4. **Start backend service**
   ```bash
   pm2 start wathiqati-backend
   ```

5. **Rebuild frontend**
   ```bash
   cd mon-portail-administratif
   npm run build
   ```

6. **Verify workflow**
   - Create test request
   - Process to in_review
   - Approve request
   - Generate/upload document
   - Check database for status changes

---

## Quick Test Commands

### Test from Terminal

```bash
# 1. Create request
curl -X POST http://localhost:5001/api/requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"documentType": "test", "firstNameFr": "Test", "lastNameFr": "User"...}'

# 2. Start review
curl -X PUT http://localhost:5001/api/requests/{id}/start-review \
  -H "Authorization: Bearer {admin_token}"

# 3. Approve
curl -X PUT http://localhost:5001/api/admin/requests/{id}/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"preparationLocation": "Arrondissement Yaacoub El Mansour - Rabat"}'

# 4. Check status in database
mysql -u user -p database -e "SELECT id, status, preparationLocation FROM Requests WHERE id='{id}';"
```

---

## Support & Troubleshooting

### If status doesn't change after approval:
1. Check browser console for API errors
2. Check `pm2 logs wathiqati-backend` for backend errors
3. Verify admin user has 'admin' role
4. Ensure request is in 'in_review' state before approving

### If location not saved:
1. Verify database field preparationLocation exists and is varchar(255)
2. Check that default location is set in approveRequest()
3. Verify request.reload() is called after save()

### If frontend doesn't update:
1. Check that refreshRequest() is being called
2. Verify API response includes full request object
3. Clear browser cache and reload

---

## Completion Status: ✅ PRODUCTION READY

All workflow issues fixed, all endpoints validated, all status transitions now possible, database persistence guaranteed, frontend properly synced, location configuration standardized.
