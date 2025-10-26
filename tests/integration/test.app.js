const express = require('express');

// mock dependencies
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

// import controller
const taskController = require('../../../controllers/v1/task.controller');

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/api/v1/task', (req, res, next) => {
  taskController.getAll(req, res, next);
});

app.post('/api/v1/task', (req, res, next) => {
  taskController.create(req, res, next);
});

app.put('/api/v1/task', (req, res, next) => {
  taskController.update(req, res, next);
});

app.delete('/api/v1/task/:id', (req, res, next) => {
  taskController.delete(req, res, next);
});

// error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'test' && {
      error: error.message,
      statusCode,
    }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = { app, taskController };
