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
};

module.exports = taskRepo;
