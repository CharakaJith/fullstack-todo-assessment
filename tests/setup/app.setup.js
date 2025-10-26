const express = require('express');
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mock the config file
jest.mock('../../config/config', () => ({
  development: {
    database: 'test_db',
    username: 'test_user',
    password: 'test_pass',
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  test: {
    database: 'test_db',
    username: 'test_user',
    password: 'test_pass',
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
}));

// mock task model
jest.mock('../../models', () => {
  const { Sequelize, DataTypes } = require('sequelize');
  const mockSequelize = new Sequelize('sqlite::memory:', { logging: false });

  const MockTask = mockSequelize.define(
    'Task',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, defaultValue: 1 },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: 'tasks', timestamps: true },
  );

  return {
    Task: MockTask,
    sequelize: mockSequelize,
    Sequelize: Sequelize,
  };
});

// mock dependencies
jest.mock('../../util/customError', () => {
  return jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  });
});

jest.mock('../../middleware/log/logger', () => jest.fn());

// mock task service
jest.mock('../../services/v1/task.service', () => ({
  getAllTasks: jest.fn(),
  createNewTask: jest.fn(),
  updateTask: jest.fn(),
  archiveTask: jest.fn(),
}));

// use the routes
try {
  const taskRoutes = require('../../routes/v1/task.route');
  app.use('/api/v1/task', taskRoutes);

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // registered routes
      console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log('Router mounted at:', middleware.regexp);
    }
  });
} catch (error) {
  console.log('Failed to load routes:', error.message);
  console.log('Error stack:', error.stack);
}

module.exports = app;
