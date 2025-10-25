const taskController = require('../../../../controllers/v1/task.controller');
const taskService = require('../../../../services/v1/task.service');

// mock task service
jest.mock('../../../../services/v1/task.service');

// mock CustomError
jest.mock('../../../../util/customError', () => {
  return jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    error.name = 'CustomError';
    return error;
  });
});

// require mocked CustomError
const CustomError = require('../../../../util/customError');

describe('Task Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  // GET: /api/v1/task
  describe('getAll', () => {
    it('should return all tasks successfully', async () => {
      const mockResponse = {
        success: true,
        status: 200,
        data: { tasks: [{ id: 1, title: 'Test Task' }] },
      };

      taskService.getAllTasks.mockResolvedValue(mockResponse);

      await taskController.getAll(mockReq, mockRes, mockNext);

      expect(taskService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 200,
          data: { tasks: [{ id: 1, title: 'Test Task' }] },
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service error');
      taskService.getAllTasks.mockRejectedValue(mockError);

      await taskController.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // POST: /api/v1/task
  describe('create', () => {
    it('should create a new task successfully', async () => {
      const mockTaskData = { title: 'New Task', description: 'Task description' };
      const mockResponse = {
        success: true,
        status: 201,
        data: { task: { id: 1, ...mockTaskData } },
      };

      mockReq.body = mockTaskData;
      taskService.createNewTask.mockResolvedValue(mockResponse);

      await taskController.create(mockReq, mockRes, mockNext);

      expect(taskService.createNewTask).toHaveBeenCalledWith(mockTaskData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 201,
          data: { task: { id: 1, ...mockTaskData } },
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors during creation', async () => {
      const mockError = new Error('Creation failed');
      mockReq.body = { title: 'New Task', description: 'Description' };
      taskService.createNewTask.mockRejectedValue(mockError);

      await taskController.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // PUT: /api/v1/task
  describe('update', () => {
    it('should update a task successfully', async () => {
      const mockTaskData = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated description',
        isCompleted: true,
      };
      const mockResponse = {
        success: true,
        status: 200,
        data: { task: mockTaskData },
      };

      mockReq.body = mockTaskData;
      taskService.updateTask.mockResolvedValue(mockResponse);

      await taskController.update(mockReq, mockRes, mockNext);

      expect(taskService.updateTask).toHaveBeenCalledWith(mockTaskData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 200,
          data: { task: mockTaskData },
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle update with no data', async () => {
      const mockResponse = {
        success: true,
        status: 200,
        data: null,
      };

      mockReq.body = { id: 1, title: 'Task', description: 'Desc', isCompleted: false };
      taskService.updateTask.mockResolvedValue(mockResponse);

      await taskController.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 200,
          data: '',
        },
      });
    });

    it('should handle service errors during update', async () => {
      const mockError = new Error('Update failed');
      mockReq.body = { id: 1, title: 'Task', description: 'Desc', isCompleted: false };
      taskService.updateTask.mockRejectedValue(mockError);

      await taskController.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // DELETE: /api/v1/task/:id
  describe('delete', () => {
    it('should archive a task successfully with no data property', async () => {
      const mockResponse = {
        success: true,
        status: 204,
      };

      mockReq.params = { id: '1' };
      taskService.archiveTask.mockResolvedValue(mockResponse);

      await taskController.delete(mockReq, mockRes, mockNext);

      expect(taskService.archiveTask).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 204,
          data: '',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should archive a task successfully with data property', async () => {
      const mockResponse = {
        success: true,
        status: 204,
        data: { message: 'Task archived' },
      };

      mockReq.params = { id: '1' };
      taskService.archiveTask.mockResolvedValue(mockResponse);

      await taskController.delete(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        response: {
          status: 204,
          data: { message: 'Task archived' },
        },
      });
    });

    it('should handle validation errors from delete service', async () => {
      const mockResponse = {
        success: false,
        status: 400,
        data: ['Invalid task id'],
      };

      mockReq.params = { id: 'invalid' };
      taskService.archiveTask.mockResolvedValue(mockResponse);

      await taskController.delete(mockReq, mockRes, mockNext);

      expect(taskService.archiveTask).toHaveBeenCalledWith('invalid');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        response: {
          status: 400,
          data: ['Invalid task id'],
        },
      });
    });

    it('should handle service errors during deletion', async () => {
      const mockError = new Error('Deletion failed');
      mockReq.params = { id: '1' };
      taskService.archiveTask.mockRejectedValue(mockError);

      await taskController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle task not found error from service', async () => {
      const mockError = CustomError('Task not found', 404);
      mockReq.params = { id: '999' };
      taskService.archiveTask.mockRejectedValue(mockError);

      await taskController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
