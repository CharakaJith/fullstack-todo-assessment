const ApiClient = require('../utils/api.client');
const { generateTestData, invalidData } = require('../utils/test.data');

describe('Task Management E2E Tests', () => {
  let apiClient;
  let createdTaskId;

  beforeAll(() => {
    apiClient = new ApiClient(global.baseURL);
  });

  beforeEach(async () => {
    // TODO: lear existing data
  });

  // create a task / POST: /api/v1/tassk
  describe('Task Creation Flow', () => {
    // create a task
    it('should create a new task successfully', async () => {
      const taskData = generateTestData.task();

      const response = await apiClient.post('/api/v1/task').send(taskData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.task.title).toBe(taskData.title);
      expect(response.body.response.data.task.description).toBe(taskData.description);
      expect(response.body.response.data.task.id).toBeDefined();

      createdTaskId = response.body.response.data.task.id;
    });

    // empty title
    it('should fail to create task with empty title', async () => {
      const response = await apiClient.post('/api/v1/task').send(invalidData.task.emptyTitle).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.response.data[0].message).toContain('required');
    });

    // invalid title
    it('should fail to create task with missing title', async () => {
      const response = await apiClient.post('/api/v1/task').send(invalidData.task.missingTitle).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // get all tasks / GET: /api/v1/task
  describe('Task Retrieval Flow', () => {
    beforeEach(async () => {
      const task1 = generateTestData.task({ title: 'E2E Task 1' });
      const task2 = generateTestData.task({ title: 'E2E Task 2' });

      const response1 = await apiClient.post('/api/v1/task').send(task1);
      const response2 = await apiClient.post('/api/v1/task').send(task2);

      testTasks = [response1.body.response.data.task, response2.body.response.data.task];
    });

    it('should retrieve all tasks', async () => {
      const response = await apiClient.get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.tasks).toBeInstanceOf(Array);
      expect(response.body.response.data.tasks.length).toBeGreaterThanOrEqual(2);

      const taskTitles = response.body.response.data.tasks.map((task) => task.title);
      expect(taskTitles).toContain('E2E Task 1');
      expect(taskTitles).toContain('E2E Task 2');
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await apiClient.get('/api/v1/task').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.tasks).toEqual([]);
    });
  });

  // update a task / PUT: /api/v1/task
  describe('Task Update Flow', () => {
    let existingTask;

    beforeEach(async () => {
      const taskData = generateTestData.task({ title: 'Task to Update' });
      const response = await apiClient.post('/api/v1/task').send(taskData);
      existingTask = response.body.response.data.task;
    });

    it('should update task successfully', async () => {
      const updateData = {
        id: existingTask.id,
        title: 'Updated Task Title',
        description: 'Updated Task Description',
        isCompleted: true,
      };

      const response = await apiClient.put('/api/v1/task').send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response.data.task.title).toBe('Updated Task Title');
      expect(response.body.response.data.task.description).toBe('Updated Task Description');
      expect(response.body.response.data.task.isCompleted).toBe(true);
    });

    it('should not uncomplete a completed task', async () => {
      const completeData = {
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        isCompleted: true,
      };

      await apiClient.put('/api/v1/task').send(completeData);

      const uncompleteData = {
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        isCompleted: false,
      };

      const response = await apiClient.put('/api/v1/task').send(uncompleteData).expect(200);

      expect(response.body.response.data.task.isCompleted).toBe(true);
    });

    it('should fail to update non-existent task', async () => {
      const updateData = {
        id: 99999,
        title: 'Non-existent Task',
        description: 'This task does not exist',
        isCompleted: true,
      };

      const response = await apiClient.put('/api/v1/task').send(updateData).expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // archive a task / DELETE: /api/v1/task
  describe('Task Deletion Flow', () => {
    let taskToDelete;

    beforeEach(async () => {
      const taskData = generateTestData.task({ title: 'Task to Delete' });
      const response = await apiClient.post('/api/v1/task').send(taskData);
      taskToDelete = response.body.response.data.task;
    });

    it('should archive task successfully', async () => {
      const response = await apiClient.delete(`/api/v1/task/${taskToDelete.id}`).expect(204);

      expect(response.body.success).toBe(true);

      const getResponse = await apiClient.get('/api/v1/task');
      const taskTitles = getResponse.body.response.data.tasks.map((task) => task.title);
      expect(taskTitles).not.toContain('Task to Delete');
    });

    it('should fail to delete non-existent task', async () => {
      const response = await apiClient.delete('/api/v1/task/99999').expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail to delete with invalid task ID', async () => {
      const response = await apiClient.delete('/api/v1/task/invalid').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Complete Task Lifecycle', () => {
    it('should complete full task lifecycle: create → read → update → delete', async () => {
      // create
      const taskData = generateTestData.task({ title: 'Lifecycle Task' });
      const createResponse = await apiClient.post('/api/v1/task').send(taskData).expect(201);

      const taskId = createResponse.body.response.data.task.id;

      // read
      const readResponse1 = await apiClient.get('/api/v1/task');
      const foundTask = readResponse1.body.response.data.tasks.find((t) => t.id === taskId);
      expect(foundTask).toBeDefined();
      expect(foundTask.title).toBe('Lifecycle Task');
      expect(foundTask.isCompleted).toBe(false);

      // update
      const updateData = {
        id: taskId,
        title: 'Updated Lifecycle Task',
        description: 'Updated during lifecycle',
        isCompleted: true,
      };

      await apiClient.put('/api/v1/task').send(updateData).expect(200);

      // verify update
      const readResponse2 = await apiClient.get('/api/v1/task');
      const updatedTask = readResponse2.body.response.data.tasks.find((t) => t.id === taskId);
      expect(updatedTask.title).toBe('Updated Lifecycle Task');
      expect(updatedTask.isCompleted).toBe(true);

      // Delete/Archive
      await apiClient.delete(`/api/v1/task/${taskId}`).expect(204);

      // erify delete/archive
      const readResponse3 = await apiClient.get('/api/v1/task');
      const deletedTask = readResponse3.body.response.data.tasks.find((t) => t.id === taskId);
      expect(deletedTask).toBeUndefined();
    });
  });
});
