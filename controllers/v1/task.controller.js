const taskService = require('../../services/v1/task.service');

const taskController = {
  getAll: async (req, res, next) => {
    try {
      const response = await taskService.getAllTasks();
      const { success, status, data } = response;

      res.status(status).json({
        success: success,
        response: {
          status: status,
          data: data,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const taskData = ({ title, description } = req.body);

      const response = await taskService.createNewTask(taskData);
      const { success, status, data } = response;

      res.status(status).json({
        success: success,
        response: {
          status: status,
          data: data,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const taskData = ({ id, title, description, isCompleted } = req.body);

      const response = await taskService.updateTask(taskData);
      const { success, status, data } = response;

      res.status(status).json({
        success: success,
        response: {
          status: status,
          data: data ? data : '',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const response = await taskService.archiveTask(id);
      const { success, status, data = '' } = response;

      res.status(status).json({
        success: success,
        response: {
          status: status,
          data: data,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;
