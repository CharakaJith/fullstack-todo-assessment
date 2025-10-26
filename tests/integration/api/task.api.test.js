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

// mock logger
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

// mock database models and config
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
  }),
  { virtual: true },
);

const request = require('supertest');

// test environment
process.env.NODE_ENV = 'test';

// import dependancies
const { app } = require('../test.app');
const taskRepo = require('../../../repos/v1/task.repo');
const fieldValidator = require('../../../util/fieldValidator');
const CustomError = require('../../../util/customError');

describe('Task API Integration Tests', () => {
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

  // POST: /api/v1/task
  describe('POST /api/v1/task', () => {
    // created a task successfully
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };

      taskRepo.insert.mockResolvedValue({ ...mockTask, ...taskData });

      const response = await request(app).post('/api/v1/task').send(taskData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe('Test Task');
      expect(response.body.data.task.description).toBe('Test Description');
    });

    // empty title/valid description
    it('should return 400 for empty title', async () => {
      const invalidTaskData = {
        title: '',
        description: 'Test Description',
      };

      fieldValidator.validate_string.mockResolvedValueOnce({ fields: 'title', message: 'Title is required' }).mockResolvedValueOnce(1);

      const response = await request(app).post('/api/v1/task').send(invalidTaskData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.data[0].message).toBe('Title is required');
    });

    // invalid title/valid description
    it('should return 400 for missing title', async () => {
      const invalidTaskData = {
        description: 'Test Description',
      };

      const response = await request(app).post('/api/v1/task').send(invalidTaskData).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // GET: /api/v1/task
  describe('GET /api/v1/task', () => {
    // get all tasks
    it('should return all tasks successfully', async () => {
      const mockTasks = [
        { ...mockTask, id: 1, title: 'Task 1' },
        { ...mockTask, id: 2, title: 'Task 2' },
      ];

      taskRepo.getAllActive.mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
      expect(response.body.data.tasks[0].title).toBe('Task 1');
      expect(response.body.data.tasks[1].title).toBe('Task 2');
    });

    // when there are no active tasks
    it('should return empty array when no tasks exist', async () => {
      taskRepo.getAllActive.mockResolvedValue([]);

      const response = await request(app).get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(0);
    });

    // server error
    it('should handle repository errors', async () => {
      taskRepo.getAllActive.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/v1/task').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });

  // PUT: /api/v1/task
  describe('PUT /api/v1/task', () => {
    // task updated successfully
    it('should update a task successfully', async () => {
      const updateData = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      const existingTask = { ...mockTask, isCompleted: false };
      const updatedTask = { ...mockTask, ...updateData };

      taskRepo.getById.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
      taskRepo.update.mockResolvedValue(1);

      const response = await request(app).put('/api/v1/task').send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe('Updated Task');
      expect(response.body.data.task.isCompleted).toBe(true);
    });

    // task not found
    it('should return 404 for non-existent task', async () => {
      const updateData = {
        id: 999,
        title: 'Updated Task',
        description: 'Updated Description',
      };

      taskRepo.getById.mockResolvedValue(null);

      const response = await request(app).put('/api/v1/task').send(updateData).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    // invalid task id
    it('should return 400 for invalid task ID', async () => {
      const updateData = {
        id: 'invalid',
        title: 'Updated Task',
        description: 'Updated Description',
      };

      fieldValidator.validate_number.mockResolvedValue({
        fields: 'task id',
        message: 'Invalid task ID',
      });

      const response = await request(app).put('/api/v1/task').send(updateData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.data[0].message).toBe('Invalid task ID');
    });
  });

  // DELETE: /api/v1/task/:id
  describe('DELETE /api/v1/task/:id', () => {
    it('should archive a task successfully', async () => {
      taskRepo.getById.mockResolvedValue(mockTask);
      taskRepo.update.mockResolvedValue(1);

      const response = await request(app).delete('/api/v1/task/1').expect(204);

      expect(response.body).toEqual({});
    });

    // task not found
    it('should return 404 for non-existent task', async () => {
      taskRepo.getById.mockResolvedValue(null);

      const response = await request(app).delete('/api/v1/task/999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    // invalid task id
    it('should return 400 for invalid task ID', async () => {
      fieldValidator.validate_number.mockResolvedValue({
        fields: 'task id',
        message: 'Invalid task ID',
      });

      const response = await request(app).delete('/api/v1/task/invalid').expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.data[0].message).toBe('Invalid task ID');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app).post('/api/v1/task').set('Content-Type', 'application/json').send('invalid json').expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle unknown routes', async () => {
      const response = await request(app).get('/api/v1/unknown').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});
