const request = require('supertest');
const app = require('../../setup/app.setup');
const { setupTestDatabase, cleanupTestDatabase, Task } = require('../../setup/database.setup');

// Mock CustomError
jest.mock('../../../util/customError', () => {
  return jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  });
});

describe('Task API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await Task.destroy({ where: {} });
  });

  describe('POST /api/v1/task', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const response = await request(app).post('/api/v1/task').send(taskData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.task.title).toBe('Test Task');
      expect(response.body.response.data.task.description).toBe('Test Description');
      expect(response.body.response.data.task.id).toBeDefined();

      // Verify task was actually created in database
      const dbTask = await Task.findByPk(response.body.response.data.task.id);
      expect(dbTask).not.toBeNull();
      expect(dbTask.title).toBe('Test Task');
    });

    it('should return 400 for empty title', async () => {
      const invalidTaskData = {
        title: '', // Empty title
        description: 'Test Description',
      };

      const response = await request(app).post('/api/v1/task').send(invalidTaskData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.response.data[0].message).toContain('required');
    });

    it('should return 400 for missing title', async () => {
      const invalidTaskData = {
        description: 'Test Description',
        // Missing title
      };

      const response = await request(app).post('/api/v1/task').send(invalidTaskData).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/task', () => {
    it('should return all tasks', async () => {
      // Create test tasks directly in database
      await Task.bulkCreate([
        { title: 'Task 1', description: 'Desc 1', userId: 1 },
        { title: 'Task 2', description: 'Desc 2', userId: 1 },
      ]);

      const response = await request(app).get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.tasks).toHaveLength(2);
      expect(response.body.response.data.tasks[0].title).toBe('Task 1');
      expect(response.body.response.data.tasks[1].title).toBe('Task 2');
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.tasks).toHaveLength(0);
    });
  });

  describe('PUT /api/v1/task', () => {
    it('should update a task successfully', async () => {
      // Create a task first
      const task = await Task.create({
        title: 'Original Task',
        description: 'Original Description',
        userId: 1,
      });

      const updateData = {
        id: task.id,
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      const response = await request(app).put('/api/v1/task').send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.task.title).toBe('Updated Task');
      expect(response.body.response.data.task.isCompleted).toBe(true);

      // Verify update in database
      const updatedTask = await Task.findByPk(task.id);
      expect(updatedTask.title).toBe('Updated Task');
      expect(updatedTask.isCompleted).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        id: 9999, // Non-existent ID
        title: 'Updated Task',
        description: 'Updated Description',
        isCompleted: true,
      };

      const response = await request(app).put('/api/v1/task').send(updateData).expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/task/:id', () => {
    it('should archive a task successfully', async () => {
      const task = await Task.create({
        title: 'Task to delete',
        description: 'Description',
        userId: 1,
      });

      const response = await request(app).delete(`/api/v1/task/${task.id}`).expect(204);

      expect(response.body.success).toBe(true);

      // Verify task is archived in database
      const archivedTask = await Task.findByPk(task.id);
      expect(archivedTask.isArchived).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/api/v1/task/9999').expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid task ID', async () => {
      const response = await request(app).delete('/api/v1/task/invalid').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle task completion logic correctly', async () => {
      // Create a completed task
      const completedTask = await Task.create({
        title: 'Completed Task',
        description: 'Description',
        userId: 1,
        isCompleted: true,
      });

      // Try to update isCompleted - should not change since it's already completed
      const updateData = {
        id: completedTask.id,
        title: 'Completed Task',
        description: 'Updated Description',
        isCompleted: false, // Trying to uncomplete
      };

      const response = await request(app).put('/api/v1/task').send(updateData).expect(200);

      // Task should remain completed
      const updatedTask = await Task.findByPk(completedTask.id);
      expect(updatedTask.isCompleted).toBe(true);
    });

    it('should not return archived tasks in GET', async () => {
      // Create both active and archived tasks
      await Task.bulkCreate([
        { title: 'Active Task', description: 'Desc', userId: 1, isArchived: false },
        { title: 'Archived Task', description: 'Desc', userId: 1, isArchived: true },
      ]);

      const response = await request(app).get('/api/v1/task').expect(200);

      expect(response.body.response.data.tasks).toHaveLength(1);
      expect(response.body.response.data.tasks[0].title).toBe('Active Task');
    });
  });
});
