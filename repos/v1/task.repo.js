const models = require('../../models');
const CustomError = require('../../util/customError');
const { REPO } = require('../../common/messages');
const { STATUS_CODE } = require('../../constants/app.constants');
const { ENTITY } = require('../../constants/entity.constants');

const taskRepo = {
  insert: async (task) => {
    try {
      return await models.Task.create(task);
    } catch (error) {
      throw new CustomError(REPO.FAILED.INSERT(ENTITY.TASK, error), STATUS_CODE.SERVER_ERROR);
    }
  },

  getById: async (taskId) => {
    try {
      return await models.Task.findOne({
        where: {
          id: taskId,
          isArchived: false,
        },
      });
    } catch (error) {
      throw new CustomError(REPO.FAILED.GET.BY_ID(ENTITY.TASK, error), STATUS_CODE.SERVER_ERROR);
    }
  },

  update: async (task) => {
    try {
      return await models.Task.update(
        {
          title: task.title,
          description: task.description,
          isCompleted: task.isCompleted,
          isArchived: task.isArchived,
        },
        {
          where: {
            id: task.id,
          },
        },
      );
    } catch (error) {
      throw new CustomError(REPO.FAILED.UPDATE(ENTITY.TASK, error), STATUS_CODE.SERVER_ERROR);
    }
  },
};

module.exports = taskRepo;
