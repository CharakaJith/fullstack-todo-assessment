const { Sequelize, DataTypes } = require('sequelize');
const { setupTestDatabase, cleanupTestDatabase, Task } = require('../../setup/database.setup');

describe('Task Database Integration Tests', () => {
  let testSequelize;

  beforeAll(async () => {
    await setupTestDatabase();
    testSequelize = require('../../setup/database.setup').testSequelize;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await Task.destroy({ where: {} });
  });

  // database operations
  describe('Task Model Operations', () => {
    // create a new task
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 1,
      };

      const task = await Task.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.userId).toBe(1);
      expect(task.isCompleted).toBe(false);
      expect(task.isArchived).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    // get task by id
    it('should read a task by ID', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        userId: 1,
      };

      const createdTask = await Task.create(taskData);
      const foundTask = await Task.findByPk(createdTask.id);

      expect(foundTask).not.toBeNull();
      expect(foundTask.id).toBe(createdTask.id);
      expect(foundTask.title).toBe('Test Task');
      expect(foundTask.description).toBe('Test description');
    });

    // update a task
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'New Task',
        description: 'New Description+',
        userId: 1,
      });

      // delay for timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedTask = await task.update({
        title: 'New Task++',
        description: 'New Description+',
        isCompleted: true,
      });

      expect(updatedTask.title).toBe('New Task++');
      expect(updatedTask.description).toBe('New Description+');
      expect(updatedTask.isCompleted).toBe(true);

      // handle same timestamps
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
    });

    // delete a task
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        userId: 1,
      });

      await task.destroy();

      const foundTask = await Task.findByPk(task.id);
      expect(foundTask).toBeNull();
    });

    // get all tasks
    it('should find all tasks', async () => {
      await Task.bulkCreate([
        { title: 'Task 1', description: 'Desc 1', userId: 1 },
        { title: 'Task 2', description: 'Desc 2', userId: 1 },
        { title: 'Task 3', description: 'Desc 3', userId: 2 },
      ]);

      const tasks = await Task.findAll();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
      expect(tasks[2].title).toBe('Task 3');
    });
  });

  // validate task model
  describe('Task Model Validations', () => {
    // title field is required
    it('should require title field', async () => {
      await expect(
        Task.create({
          description: 'No title provided',
          userId: 1,
        }),
      ).rejects.toThrow();
    });

    // user id is required
    it('should require userId field', async () => {
      await expect(
        Task.create({
          title: 'No user ID',
          description: 'No user ID provided',
        }),
      ).rejects.toThrow();
    });

    // title cannot be empty
    it('should validate title is not empty', async () => {
      await expect(
        Task.create({
          title: '',
          description: 'Test',
          userId: 1,
        }),
      ).rejects.toThrow();
    });
  });
});
