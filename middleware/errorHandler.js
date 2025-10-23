const logger = require('./log/logger');
const { APP_ENV, STATUS_CODE } = require('../constants/app.constants');

const errorHandler = (err, req, res, next) => {
  const { status, statusCode, message, stack } = err;
  const httpCode = statusCode || STATUS_CODE.SERVER_ERROR;

  logger(status, false, httpCode, message, req);

  res.status(httpCode).json({
    success: false,
    response: {
      status: httpCode,
      data: {
        message: message,
      },
      stack: process.env.NODE_ENV === APP_ENV.DEV ? stack : undefined,
    },
  });
};

module.exports = errorHandler;
