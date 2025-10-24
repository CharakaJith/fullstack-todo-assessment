const taskService = require('../../services/v1/task.service');
const taskRepo = require('../../repos/v1/task.repo');
const fieldValidator = require('../../util/fieldValidator');
const logger = require('../../middleware/log/logger');

const { STATUS_CODE } = require('../../constants/app.constants');
const { LOG_TYPE } = require('../../constants/logger.constants');

// mock dependencies
jest.mock('../../repos/v1/task.repo');
jest.mock('../../middleware/log/logger');

// mock CustomError
jest.mock('../../util/customError', () => {
  const MockCustomError = function (message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = 'CustomError';
  };

  MockCustomError.prototype = Object.create(Error.prototype);
  MockCustomError.prototype.constructor = MockCustomError;

  return MockCustomError;
});

// mock fieldValidator
fieldValidator.validate_string = jest.fn();
fieldValidator.validate_number = jest.fn();
fieldValidator.validate_boolean = jest.fn();

describe('taskService', () => {
  let mockTaskData;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTaskData = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      description: 'Testing task service',
      isCompleted: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // getAllTasks
  describe('getAllTasks', () => {
    it('should return all active tasks with success', async () => {
      const mockTasks = [mockTaskData, mockTaskData];
      taskRepo.getAllActive.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();

      expect(taskRepo.getAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { tasks: mockTasks },
      });
    });

    it('should handle empty task list', async () => {
      taskRepo.getAllActive.mockResolvedValue([]);

      const result = await taskService.getAllTasks();

      expect(taskRepo.getAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { tasks: [] },
      });
    });
  });

  // createNewTask
  describe('createNewTask', () => {
    it('should return BAD_REQUEST if validation fails', async () => {
      // invalid title, valid description
      fieldValidator.validate_string.mockResolvedValueOnce('Invalid title').mockResolvedValueOnce(1);

      const data = { title: '', description: 'Valid description' };
      const result = await taskService.createNewTask(data);

      expect(fieldValidator.validate_string).toHaveBeenCalledTimes(2);
      expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, ['Invalid title']);
      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: ['Invalid title'],
      });
    });

    it('should create a new task if validation passes', async () => {
      const newTask = { id: 1, userId: 1, title: 'Task', description: 'Desc' };
      fieldValidator.validate_string.mockResolvedValue(1);
      taskRepo.insert.mockResolvedValue(newTask);

      const data = { title: 'Task', description: 'Desc' };
      const result = await taskService.createNewTask(data);

      expect(fieldValidator.validate_string).toHaveBeenCalledTimes(2);
      expect(taskRepo.insert).toHaveBeenCalledWith({
        userId: 1,
        title: 'Task',
        description: 'Desc',
      });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.CREATED,
        data: { task: newTask },
      });
    });
  });

  // update task
  describe('updateTask', () => {
    it('should return BAD_REQUEST if validation fails', async () => {
      fieldValidator.validate_number.mockResolvedValueOnce('Invalid id');
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      // invalid id
      const data = { id: 'x', title: '', description: '', isCompleted: false };
      const result = await taskService.updateTask(data);

      expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, ['Invalid id']);
      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: ['Invalid id'],
      });
    });

    it('should throw CustomError if task not found', async () => {
      fieldValidator.validate_number.mockResolvedValue(1);
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      taskRepo.getById.mockResolvedValue(null);

      try {
        await taskService.updateTask({
          id: 999,
          title: 'Test',
          description: 'Test',
          isCompleted: false,
        });
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toBe('Invalid task ID');
        expect(error.statusCode).toBe(STATUS_CODE.NOT_FOUND);
      }
    });

    it('should throw CustomError if update fails', async () => {
      const existingTask = { id: 1, title: 'Old', description: 'Old', isCompleted: false };

      fieldValidator.validate_number.mockResolvedValue(1);
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      taskRepo.getById.mockResolvedValue(existingTask);
      taskRepo.update.mockResolvedValue(0); // simulate update fail

      try {
        await taskService.updateTask({
          id: 1,
          title: 'New',
          description: 'New',
          isCompleted: true,
        });
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toBe('Failed to update the task');
        expect(error.statusCode).toBe(STATUS_CODE.BAD_REQUEST);
      }
    });

    it('should update task successfully when task is not completed', async () => {
      const existingTask = { id: 1, title: 'Old', description: 'Old', isCompleted: false };
      const updatedTask = { id: 1, title: 'New', description: 'New', isCompleted: true };

      fieldValidator.validate_number.mockResolvedValue(1);
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      taskRepo.getById.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
      taskRepo.update.mockResolvedValue(1);

      const result = await taskService.updateTask({
        id: 1,
        title: 'New',
        description: 'New',
        isCompleted: true,
      });

      expect(taskRepo.update).toHaveBeenCalledWith({
        ...existingTask,
        title: 'New',
        description: 'New',
        isCompleted: true,
      });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { task: updatedTask },
      });
    });

    it('should keep task completed when updating an already completed task', async () => {
      const existingTask = { id: 1, title: 'Old', description: 'Old', isCompleted: true };
      const updatedTask = { id: 1, title: 'New', description: 'New', isCompleted: true };

      fieldValidator.validate_number.mockResolvedValue(1);
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      taskRepo.getById.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
      taskRepo.update.mockResolvedValue(1);

      const result = await taskService.updateTask({
        id: 1,
        title: 'New',
        description: 'New',
        isCompleted: false,
      });

      expect(taskRepo.update).toHaveBeenCalledWith({
        ...existingTask,
        title: 'New',
        description: 'New',
        isCompleted: true,
      });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { task: updatedTask },
      });
    });

    // edge case - task is not completed and we set isCompleted to false
    it('should update task with false completion status when task is not completed', async () => {
      const existingTask = { id: 1, title: 'Old', description: 'Old', isCompleted: false };
      const updatedTask = { id: 1, title: 'New', description: 'New', isCompleted: false };

      fieldValidator.validate_number.mockResolvedValue(1);
      fieldValidator.validate_string.mockResolvedValue(1);
      fieldValidator.validate_boolean.mockResolvedValue(1);

      taskRepo.getById.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
      taskRepo.update.mockResolvedValue(1);

      const result = await taskService.updateTask({
        id: 1,
        title: 'New',
        description: 'New',
        isCompleted: false,
      });

      expect(taskRepo.update).toHaveBeenCalledWith({
        ...existingTask,
        title: 'New',
        description: 'New',
        isCompleted: false,
      });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { task: updatedTask },
      });
    });
  });

  // archive/delete task
  describe('archiveTask', () => {
    it('should return BAD_REQUEST when validation fails', async () => {
      fieldValidator.validate_number.mockResolvedValue('invalid id');

      const result = await taskService.archiveTask('abc');

      expect(fieldValidator.validate_number).toHaveBeenCalledWith('abc', 'task id');
      expect(logger).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: ['invalid id'],
      });
    });

    it('should throw CustomError when task not found', async () => {
      fieldValidator.validate_number.mockResolvedValue(1);
      taskRepo.getById.mockResolvedValue(null);

      try {
        await taskService.archiveTask(1);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(['Invalid task ID', 'Task not found']).toContain(error.message);
        expect(error.statusCode).toBe(STATUS_CODE.NOT_FOUND);
      }

      expect(taskRepo.getById).toHaveBeenCalledWith(1);
    });

    it('should successfully archive a task', async () => {
      fieldValidator.validate_number.mockResolvedValue(1);
      const mockTask = { id: 1, title: 'Test Task', isArchived: false };
      taskRepo.getById.mockResolvedValue(mockTask);
      taskRepo.update.mockResolvedValue();

      const result = await taskService.archiveTask(1);

      expect(taskRepo.getById).toHaveBeenCalledWith(1);
      expect(taskRepo.update).toHaveBeenCalledWith({ ...mockTask, isArchived: true });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.NO_CONTENT,
      });
    });
  });
});
