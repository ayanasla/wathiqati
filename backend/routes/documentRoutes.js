const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireEmployeeOrAdmin } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/fileUpload');
const {
  requestDocument,
  getDocument,
  getMyDocuments,
  getAllDocuments,
  updateDocumentStatus,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();

router.post('/', authenticate, requestDocument);
router.get('/my', authenticate, getMyDocuments);
router.get('/', authenticate, requireEmployeeOrAdmin, getAllDocuments);
router.get('/:id', authenticate, getDocument);
router.put('/:id/status', authenticate, requireEmployeeOrAdmin, updateDocumentStatus);
router.post('/:id/upload', authenticate, requireEmployeeOrAdmin, upload.single('file'), uploadDocument);
router.get('/:id/download', authenticate, downloadDocument);
router.delete('/:id', authenticate, requireEmployeeOrAdmin, deleteDocument);

module.exports = router;
