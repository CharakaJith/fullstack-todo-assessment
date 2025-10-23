const taskService = require('../../services/v1/task.service');

const taskController = {
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
};

module.exports = taskController;
