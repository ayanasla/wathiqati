const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireEmployeeOrAdmin } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/fileUpload');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/', authenticate, requestController.create);
router.get('/', authenticate, requestController.list);
router.get('/:id/document', authenticate, requestController.getDocument);
router.get('/:id/download', authenticate, requestController.downloadDocument);
router.post('/:id/document', authenticate, requireEmployeeOrAdmin, upload.single('document'), requestController.uploadDocument);
router.get('/:id', authenticate, requestController.get);
router.put('/:id', authenticate, requestController.update); // owner or admin
router.put('/:id/start-review', authenticate, requireEmployeeOrAdmin, requestController.startReview);
router.put('/:id/generate-document', authenticate, requireEmployeeOrAdmin, requestController.generateDocument);
router.get('/:id/history', authenticate, requestController.getRequestWithHistory);
router.delete('/:id', authenticate, requestController.remove); // owner or admin

module.exports = router;