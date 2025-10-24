const logger = require('../../middleware/log/logger');
const CustomError = require('../../util/customError');
const taskRepo = require('../../repos/v1/task.repo');
const fieldValidator = require('../../util/fieldValidator');

const { LOG_TYPE } = require('../../constants/logger.constants');
const { STATUS_CODE } = require('../../constants/app.constants');
const { RESPONSE } = require('../../common/messages');

const taskService = {
  getAllTasks: async () => {
    const tasks = await taskRepo.getAllActive();

    return {
      success: true,
      status: STATUS_CODE.OK,
      data: {
        tasks: tasks,
      },
    };
  },

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
      userId: 1, // TODO (ENHANCEMENT): must be updated with request user
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

  updateTask: async (data) => {
    const { id, title, description, isCompleted } = data;

    // validate user inputs
    const errorArray = [];
    errorArray.push(await fieldValidator.validate_number(id, 'task id'));
    errorArray.push(await fieldValidator.validate_string(title, 'title'));
    errorArray.push(await fieldValidator.validate_string(description, 'description'));
    errorArray.push(await fieldValidator.validate_boolean(isCompleted, 'task status'));

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

    // get task
    const task = await taskRepo.getById(id);
    if (!task) {
      throw new CustomError(RESPONSE.TASK.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    // TODO (ENHANCEMENT): check task belongs to request user before updating

    // update task
    task.title = title;
    task.description = description;
    task.isCompleted = !task.isCompleted ? isCompleted : true; // only allowed to changed if not completed
    var updatedTask = await taskRepo.update(task);

    if (updatedTask == 1) {
      updatedTask = await taskRepo.getById(id);
    } else {
      throw new CustomError(RESPONSE.TASK.UPDATE_FAILED, STATUS_CODE.BAD_REQUEST);
    }

    return {
      success: true,
      status: STATUS_CODE.OK,
      data: {
        task: updatedTask,
      },
    };
  },

  archiveTask: async (taskId) => {
    // sanitize task id
    const errorArray = [];
    errorArray.push(await fieldValidator.validate_number(taskId, 'task id'));

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

    // get task
    const task = await taskRepo.getById(taskId);
    if (!task) {
      throw new CustomError(RESPONSE.TASK.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    // TODO (ENHANCEMENT): check task belongs to request user before deleting

    // archive task
    task.isArchived = true;
    await taskRepo.update(task);

    return {
      success: true,
      status: STATUS_CODE.NO_CONTENT,
    };
  },
};

module.exports = taskService;
