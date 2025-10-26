// mock task repo
jest.mock('../../../repos/v1/task.repo', () => ({
  getAllActive: jest.fn(),
  getById: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}));

// mock field validator
jest.mock('../../../util/fieldValidator', () => ({
  validate_string: jest.fn(),
  validate_number: jest.fn(),
  validate_boolean: jest.fn(),
}));

// mock middleware
jest.mock('../../../middleware/log/logger', () => jest.fn());

// mock custom error
jest.mock('../../../util/customError', () => {
  return jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  });
});

// mock the database and dependencies
jest.mock('../../../models', () => ({}));
jest.mock(
  '../../../config/config.json',
  () => ({
    development: {
      username: 'test',
      password: 'test',
      database: 'test_db',
      host: 'localhost',
      dialect: 'mysql',
    },
    test: {
      username: 'test',
      password: 'test',
      database: 'test_db',
      host: 'localhost',
      dialect: 'mysql',
    },
    production: {
      username: 'test',
      password: 'test',
      database: 'test_db',
      host: 'localhost',
      dialect: 'mysql',
    },
  }),
  { virtual: true },
);

// import modules
const taskService = require('../../../services/v1/task.service');
const taskRepo = require('../../../repos/v1/task.repo');
const fieldValidator = require('../../../util/fieldValidator');
const logger = require('../../../middleware/log/logger');
const CustomError = require('../../../util/customError');

const { STATUS_CODE } = require('../../../constants/app.constants');
const { LOG_TYPE } = require('../../../constants/logger.constants');
const { RESPONSE } = require('../../../common/messages');

describe('Task Service Integration Tests', () => {
  let mockTask;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      description: 'Test Description',
      isCompleted: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fieldValidator.validate_string.mockResolvedValue(1);
    fieldValidator.validate_number.mockResolvedValue(1);
    fieldValidator.validate_boolean.mockResolvedValue(1);
  });

  // get all tasks
  describe('getAllTasks', () => {
    // if there are tasks
    it('should return all active tasks successfully', async () => {
      const mockTasks = [mockTask, { ...mockTask, id: 2 }];
      taskRepo.getAllActive.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();

      expect(taskRepo.getAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { tasks: mockTasks },
      });
    });

    // if there are no active tasks
    it('should return empty array when no tasks exist', async () => {
      taskRepo.getAllActive.mockResolvedValue([]);

      const result = await taskService.getAllTasks();

      expect(taskRepo.getAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { tasks: [] },
      });
    });

    // server error
    it('should handle repository errors', async () => {
      const repoError = new Error('Database connection failed');
      taskRepo.getAllActive.mockRejectedValue(repoError);

      await expect(taskService.getAllTasks()).rejects.toThrow('Database connection failed');
    });
  });

  // create a new task
  describe('createNewTask', () => {
    // valid title/valid description
    it('should create a new task successfully with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };

      taskRepo.insert.mockResolvedValue({ ...mockTask, ...taskData });

      const result = await taskService.createNewTask(taskData);

      expect(fieldValidator.validate_string).toHaveBeenCalledTimes(2);
      expect(fieldValidator.validate_string).toHaveBeenCalledWith('Test Task', 'title');
      expect(fieldValidator.validate_string).toHaveBeenCalledWith('Test Description', 'description');

      expect(taskRepo.insert).toHaveBeenCalledWith({
        userId: 1,
        title: 'Test Task',
        description: 'Test Description',
      });

      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.CREATED,
        data: {
          task: { ...mockTask, ...taskData },
        },
      });
    });

    // empty title/valid description
    it('should return validation errors for empty title', async () => {
      const invalidData = {
        title: '',
        description: 'Test Description',
      };

      fieldValidator.validate_string.mockResolvedValueOnce({ fields: 'title', message: 'Title is required' }).mockResolvedValueOnce(1);

      const result = await taskService.createNewTask(invalidData);

      expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, [{ fields: 'title', message: 'Title is required' }]);
      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: [{ fields: 'title', message: 'Title is required' }],
      });
      expect(taskRepo.insert).not.toHaveBeenCalled();
    });

    // valid title/empty description
    it('should return validation errors for missing description', async () => {
      const invalidData = {
        title: 'Test Title',
        description: '',
      };

      fieldValidator.validate_string.mockResolvedValueOnce(1).mockResolvedValueOnce({ fields: 'description', message: 'Description is required' });

      const result = await taskService.createNewTask(invalidData);

      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: [{ fields: 'description', message: 'Description is required' }],
      });
    });

    // empty title/empty description
    it('should return multiple validation errors', async () => {
      const invalidData = {
        title: '',
        description: '',
      };

      fieldValidator.validate_string
        .mockResolvedValueOnce({ fields: 'title', message: 'Title is required' })
        .mockResolvedValueOnce({ fields: 'description', message: 'Description is required' });

      const result = await taskService.createNewTask(invalidData);

      expect(result.data).toHaveLength(2);
      expect(result.success).toBe(false);
      expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
    });

    // server error
    it('should handle repository errors during creation', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
      };

      const repoError = new Error('Database insert failed');
      taskRepo.insert.mockRejectedValue(repoError);

      await expect(taskService.createNewTask(taskData)).rejects.toThrow('Database insert failed');
    });
  });

  // update a task
  describe('updateTask', () => {
    it('should update a task successfully with valid data', async () => {
      const updateData = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      const existingTask = { ...mockTask, isCompleted: false };
      const updatedTask = { ...mockTask, ...updateData };

      taskRepo.getById.mockResolvedValueOnce(existingTask);
      taskRepo.update.mockResolvedValue(1);
      taskRepo.getById.mockResolvedValueOnce(updatedTask);

      const result = await taskService.updateTask(updateData);

      expect(fieldValidator.validate_number).toHaveBeenCalledWith(1, 'task id');
      expect(fieldValidator.validate_string).toHaveBeenCalledWith('Updated Task', 'title');
      expect(fieldValidator.validate_string).toHaveBeenCalledWith('Updated Description', 'description');
      expect(fieldValidator.validate_boolean).toHaveBeenCalledWith(true, 'task status');

      expect(taskRepo.getById).toHaveBeenCalledWith(1);
      expect(taskRepo.update).toHaveBeenCalledWith({
        ...existingTask,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      });

      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.OK,
        data: { task: updatedTask },
      });
    });

    it('should keep task completed when updating already completed task', async () => {
      const updateData = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: false,
      };

      const existingTask = { ...mockTask, isCompleted: true };
      const updatedTask = { ...mockTask, ...updateData, isCompleted: true };

      taskRepo.getById.mockResolvedValueOnce(existingTask);
      taskRepo.update.mockResolvedValue(1);
      taskRepo.getById.mockResolvedValueOnce(updatedTask);

      const result = await taskService.updateTask(updateData);

      // status must be completed even tried to set to false
      expect(taskRepo.update).toHaveBeenCalledWith({
        ...existingTask,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      });

      expect(result.data.task.isCompleted).toBe(true);
    });

    // invalid task id
    it('should return validation errors for invalid task ID', async () => {
      const invalidData = {
        id: 'invalid',
        title: 'Valid Title',
        description: 'Valid Description',
        isCompleted: true,
      };

      fieldValidator.validate_number.mockResolvedValue({ fields: 'task id', message: 'Task ID must be a number' });

      const result = await taskService.updateTask(invalidData);

      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: [{ fields: 'task id', message: 'Task ID must be a number' }],
      });
      expect(taskRepo.getById).not.toHaveBeenCalled();
    });

    // task not found
    it('should throw CustomError when task not found', async () => {
      const updateData = {
        id: 999,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      taskRepo.getById.mockResolvedValue(null);

      await expect(taskService.updateTask(updateData)).rejects.toThrow(RESPONSE.TASK.NOT_FOUND);
      expect(CustomError).toHaveBeenCalledWith(RESPONSE.TASK.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    });

    // update failed
    it('should throw CustomError when update fails', async () => {
      const updateData = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      taskRepo.getById.mockResolvedValue(mockTask);
      taskRepo.update.mockResolvedValue(0); // Simulate update failure

      await expect(taskService.updateTask(updateData)).rejects.toThrow(RESPONSE.TASK.UPDATE_FAILED);
      expect(CustomError).toHaveBeenCalledWith(RESPONSE.TASK.UPDATE_FAILED, STATUS_CODE.BAD_REQUEST);
    });

    // empty id/empty title/empty description
    it('should handle multiple validation errors', async () => {
      const invalidData = {
        id: 'invalid',
        title: '',
        description: '',
        isCompleted: 'not-boolean',
      };

      fieldValidator.validate_number.mockResolvedValue({ fields: 'task id', message: 'Invalid task ID' });
      fieldValidator.validate_string.mockResolvedValue({ fields: 'title', message: 'Title required' });
      fieldValidator.validate_string.mockResolvedValue({ fields: 'description', message: 'Description required' });
      fieldValidator.validate_boolean.mockResolvedValue({ fields: 'task status', message: 'Invalid status' });

      const result = await taskService.updateTask(invalidData);

      expect(result.data).toHaveLength(4);
      expect(result.success).toBe(false);
      expect(result.status).toBe(STATUS_CODE.BAD_REQUEST);
    });
  });

  // arhcive a task
  describe('archiveTask', () => {
    it('should archive a task successfully with valid task ID', async () => {
      taskRepo.getById.mockResolvedValue(mockTask);
      taskRepo.update.mockResolvedValue(1);

      const result = await taskService.archiveTask(1);

      expect(fieldValidator.validate_number).toHaveBeenCalledWith(1, 'task id');
      expect(taskRepo.getById).toHaveBeenCalledWith(1);
      expect(taskRepo.update).toHaveBeenCalledWith({
        ...mockTask,
        isArchived: true,
      });
      expect(result).toEqual({
        success: true,
        status: STATUS_CODE.NO_CONTENT,
      });
    });

    // invalid task id
    it('should return validation errors for invalid task ID', async () => {
      fieldValidator.validate_number.mockResolvedValue({ fields: 'task id', message: 'Invalid task ID' });

      const result = await taskService.archiveTask('invalid');

      expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, [{ fields: 'task id', message: 'Invalid task ID' }]);
      expect(result).toEqual({
        success: false,
        status: STATUS_CODE.BAD_REQUEST,
        data: [{ fields: 'task id', message: 'Invalid task ID' }],
      });
      expect(taskRepo.getById).not.toHaveBeenCalled();
    });

    // task not found
    it('should throw CustomError when task to archive is not found', async () => {
      taskRepo.getById.mockResolvedValue(null);

      await expect(taskService.archiveTask(999)).rejects.toThrow(RESPONSE.TASK.NOT_FOUND);
      expect(CustomError).toHaveBeenCalledWith(RESPONSE.TASK.NOT_FOUND, STATUS_CODE.NOT_FOUND);
    });

    // server error
    it('should handle repository errors during archiving', async () => {
      taskRepo.getById.mockResolvedValue(mockTask);
      const repoError = new Error('Database update failed');
      taskRepo.update.mockRejectedValue(repoError);

      await expect(taskService.archiveTask(1)).rejects.toThrow('Database update failed');
    });

    it('should archive already archived task without error', async () => {
      const archivedTask = { ...mockTask, isArchived: true };
      taskRepo.getById.mockResolvedValue(archivedTask);
      taskRepo.update.mockResolvedValue(1);

      const result = await taskService.archiveTask(1);

      expect(taskRepo.update).toHaveBeenCalledWith({
        ...archivedTask,
        isArchived: true,
      });
      expect(result.success).toBe(true);
    });
  });

  // logger
  describe('Error Handling and Logging', () => {
    it('should log validation errors appropriately', async () => {
      const invalidData = {
        title: '',
        description: 'Valid Description',
      };

      fieldValidator.validate_string.mockResolvedValueOnce({ fields: 'title', message: 'Title is required' }).mockResolvedValueOnce(1);

      await taskService.createNewTask(invalidData);

      expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.BAD_REQUEST, [{ fields: 'title', message: 'Title is required' }]);
    });

    it('should propagate repository errors with proper context', async () => {
      const repoError = new CustomError('Database connection failed', STATUS_CODE.SERVER_ERROR);
      taskRepo.getAllActive.mockRejectedValue(repoError);

      await expect(taskService.getAllTasks()).rejects.toThrow('Database connection failed');

      const thrownError = await taskService.getAllTasks().catch((err) => err);
      expect(thrownError.statusCode).toBe(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle unexpected errors gracefully', async () => {
      const unexpectedError = new Error('Unexpected system error');
      taskRepo.getAllActive.mockRejectedValue(unexpectedError);

      await expect(taskService.getAllTasks()).rejects.toThrow('Unexpected system error');
    });
  });
});
