const express = require('express');
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mock controller
jest.mock('../../controllers/v1/task.controller', () => {
  const mockTaskController = {
    getAll: jest.fn((req, res) => {
      res.status(200).json({
        success: true,
        response: {
          status: 200,
          data: { tasks: [] },
        },
      });
    }),

    create: jest.fn((req, res) => {
      res.status(201).json({
        success: true,
        response: {
          status: 201,
          data: {
            task: {
              id: 1,
              ...req.body,
              userId: 1,
            },
          },
        },
      });
    }),

    update: jest.fn((req, res) => {
      res.status(200).json({
        success: true,
        response: {
          status: 200,
          data: {
            task: {
              id: req.body.id,
              ...req.body,
            },
          },
        },
      });
    }),

    delete: jest.fn((req, res) => {
      res.status(204).json({
        success: true,
        response: {
          status: 204,
          data: '',
        },
      });
    }),
  };

  return mockTaskController;
});

// require controller
const taskController = require('../../controllers/v1/task.controller');

// define routes
const router = express.Router();

router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.put('/', taskController.update);
router.delete('/:id', taskController.delete);

app.use('/api/v1/task', router);

// error handling middleware
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'test' && { stack: error.stack }),
  });
});

app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router' && middleware.regexp) {
    console.log('Router mounted for /api/v1/task');
  }
});

module.exports = { app, taskController };
