const logger = require('../../middleware/log/logger');
const taskRepo = require('../../repos/v1/task.repo');
const fieldValidator = require('../../util/fieldValidator');

const { LOG_TYPE } = require('../../constants/logger.constants');
const { STATUS_CODE } = require('../../constants/app.constants');

const taskService = {
  createNewTask: async (data) => {
    const { title, description } = data;

    // validate user inputs
    const errorArray = [];
    errorArray.push(await fieldValidator.validate_string(title, 'title'));
    errorArray.push(await fieldValidator.validate_string(description, 'description'));

    // check request data
    const filteredErrors = errorArray.filter((obj) => obj !== 1);
    if (filteredErrors.length !== 0) {
      logger(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, filteredErrors);

      return {
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: filteredErrors,
      };
    }

    // create new task
    const taskData = {
      userId: 1, // TODO: must be updated with request user
      title: title,
      description: description,
    };
    const newTask = await taskRepo.insert(taskData);

    return {
      success: true,
      status: STATUS_CODE.CREATED,
      data: {
        task: newTask,
      },
    };
  },
};

module.exports = taskService;
