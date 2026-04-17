const TaskService = require('../services/taskService');
const { validateTaskInput, validatePaginationParams } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, deadline, assignedUserId } = req.body;
    
    const validation = validateTaskInput(title, description, deadline);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const task = await TaskService.createTask(
      { title, description, priority, deadline, assignedUserId },
      req.user.id
    );

    logger.info('Task created', { taskId: task.id, createdBy: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    logger.error('Create task error', error);
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await TaskService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    logger.error('Get task error', error);
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedUserId, limit, offset } = req.query;
    const pagination = validatePaginationParams(limit, offset);

    const tasks = await TaskService.getAllTasks({
      status,
      priority,
      assignedUserId,
      ...pagination,
    });

    res.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    logger.error('Get tasks error', error);
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const tasks = await TaskService.getMyTasks(req.user.id, { status });

    res.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    logger.error('Get my tasks error', error);
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await TaskService.updateTask(id, updateData, req.user.id);

    logger.info('Task updated', { taskId: id, updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Update task error', error);
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    await TaskService.deleteTask(id);

    logger.info('Task deleted', { taskId: id, deletedBy: req.user.id });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    logger.error('Delete task error', error);
    next(error);
  }
};

module.exports = {
  createTask,
  getTask,
  getAllTasks,
  getMyTasks,
  updateTask,
  deleteTask,
};
