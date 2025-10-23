const express = require('express');
const routesV1 = express.Router();
const taskRouter = require('./task.routes');

routesV1.use('/task', taskRouter);

module.exports = routesV1;
