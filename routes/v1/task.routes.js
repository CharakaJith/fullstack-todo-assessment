const express = require('express');
const taskController = require('../../controllers/v1/task.controller');

const taskRouter = express.Router();

taskRouter.post('/', taskController.create);

module.exports = taskRouter;
