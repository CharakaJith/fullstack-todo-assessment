const models = require('../../models');
const taskRepo = require('../../repos/v1/task.repo');
const CustomError = require('../../util/customError');
const { STATUS_CODE } = require('../../constants/app.constants');
const { ENTITY } = require('../../constants/entity.constants');
const { REPO } = require('../../common/messages');

// mock task model actions
jest.mock('../../models', () => ({
  Task: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Task Repo', () => {
  let mockTaskData;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTaskData = {
      id: 1,
      userId: 10,
      title: 'Test Task',
      description: 'Testing task repo',
      isCompleted: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // GET ALL
  describe('getAllActive', () => {
    it('should return active tasks', async () => {
      const findAllMock = jest.fn().mockResolvedValue([mockTaskData]);
      models.Task = { findAll: findAllMock };

      const result = await taskRepo.getAllActive();
      expect(findAllMock).toHaveBeenCalledWith({
        where: { isArchived: false },
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual([mockTaskData]);
    });

    it('should throw CustomError on failure', async () => {
      const error = new Error('DB error');
      models.Task = { findAll: jest.fn().mockRejectedValue(error) };

      await expect(taskRepo.getAllActive()).rejects.toThrow(CustomError);
      await expect(taskRepo.getAllActive()).rejects.toThrow(REPO.FAILED.GET.All(ENTITY.TASK, error));
    });
  });

  // GET BY ID
  describe('getById', () => {
    it('should return the task by id', async () => {
      const findOneMock = jest.fn().mockResolvedValue(mockTaskData);
      models.Task = { findOne: findOneMock };

      const result = await taskRepo.getById(1);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { id: 1, isArchived: false },
      });
      expect(result).toEqual(mockTaskData);
    });

    it('should throw CustomError on failure', async () => {
      const error = new Error('Find error');
      models.Task = { findOne: jest.fn().mockRejectedValue(error) };

      await expect(taskRepo.getById(1)).rejects.toThrow(CustomError);
      await expect(taskRepo.getById(1)).rejects.toThrow(REPO.FAILED.GET.BY_ID(ENTITY.TASK, error));
    });
  });

  // INSERT
  describe('insert', () => {
    it('should create a new task', async () => {
      const createMock = jest.fn().mockResolvedValue(mockTaskData);
      models.Task = { create: createMock };

      const result = await taskRepo.insert(mockTaskData);
      expect(createMock).toHaveBeenCalledWith(mockTaskData);
      expect(result).toEqual(mockTaskData);
    });

    it('should throw CustomError on failure', async () => {
      const error = new Error('Insert error');
      models.Task = { create: jest.fn().mockRejectedValue(error) };

      await expect(taskRepo.insert(mockTaskData)).rejects.toThrow(CustomError);
      await expect(taskRepo.insert(mockTaskData)).rejects.toThrow(REPO.FAILED.INSERT(ENTITY.TASK, error));
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update the task', async () => {
      const updateMock = jest.fn().mockResolvedValue([1]); // Sequelize returns [affectedCount]
      models.Task = { update: updateMock };

      const result = await taskRepo.update(mockTaskData);
      expect(updateMock).toHaveBeenCalledWith(
        {
          title: mockTaskData.title,
          description: mockTaskData.description,
          isCompleted: mockTaskData.isCompleted,
          isArchived: mockTaskData.isArchived,
        },
        { where: { id: mockTaskData.id } },
      );
      expect(result).toEqual([1]);
    });

    it('should throw CustomError on failure', async () => {
      const error = new Error('Update error');
      models.Task = { update: jest.fn().mockRejectedValue(error) };

      await expect(taskRepo.update(mockTaskData)).rejects.toThrow(CustomError);
      await expect(taskRepo.update(mockTaskData)).rejects.toThrow(REPO.FAILED.UPDATE(ENTITY.TASK, error));
    });
  });
});
