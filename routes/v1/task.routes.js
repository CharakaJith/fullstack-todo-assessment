const express = require('express');
const taskController = require('../../controllers/v1/task.controller');

const taskRouter = express.Router();

taskRouter.get('/', taskController.getAll);
taskRouter.post('/', taskController.create);
taskRouter.delete('/:id', taskController.delete);

module.exports = taskRouter;
