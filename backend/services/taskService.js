const { Task, User, Notification } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class TaskService {
  static async createTask(taskData, createdByUserId) {
    try {
      const task = await Task.create({
        ...taskData,
        createdByUserId,
      });

      if (taskData.assignedUserId) {
        await Notification.create({
          userId: taskData.assignedUserId,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          type: 'task',
          relatedId: task.id,
        });
      }

      return task;
    } catch (error) {
      logger.error('Error creating task', error);
      throw error;
    }
  }

  static async getTaskById(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        ],
      });
      return task;
    } catch (error) {
      logger.error('Error getting task', error);
      throw error;
    }
  }

  static async getAllTasks(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.assignedUserId) {
        where.assignedUserId = filters.assignedUserId;
      }

      const tasks = await Task.findAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting tasks', error);
      throw error;
    }
  }

  static async getMyTasks(userId, filters = {}) {
    try {
      const tasks = await Task.findAll({
        where: {
          assignedUserId: userId,
          ...(filters.status && { status: filters.status }),
        },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        ],
        order: [['deadline', 'ASC'], ['createdAt', 'DESC']],
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting user tasks', error);
      throw error;
    }
  }

  static async updateTask(taskId, updateData, userId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw { statusCode: 404, message: 'Task not found' };
      }

      const oldStatus = task.status;
      await task.update(updateData);

      if (updateData.status === 'done' && oldStatus !== 'done') {
        task.completedAt = new Date();
        await task.save();
      }

      return task;
    } catch (error) {
      logger.error('Error updating task', error);
      throw error;
    }
  }

  static async deleteTask(taskId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw { statusCode: 404, message: 'Task not found' };
      }

      await task.destroy();
      return true;
    } catch (error) {
      logger.error('Error deleting task', error);
      throw error;
    }
  }
}

module.exports = TaskService;
