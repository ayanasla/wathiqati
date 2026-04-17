const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireEmployeeOrAdmin } = require('../middleware/roleMiddleware');
const {
  createTask,
  getTask,
  getAllTasks,
  getMyTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.post('/', authenticate, requireEmployeeOrAdmin, createTask);
router.get('/', authenticate, requireEmployeeOrAdmin, getAllTasks);
router.get('/my', authenticate, getMyTasks);
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, requireEmployeeOrAdmin, deleteTask);

module.exports = router;
