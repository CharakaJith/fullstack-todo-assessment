const { LOG_TYPE } = require('../constants/logger.constants');

class CustomError extends Error {
  constructor(message, statusCode) {
    const status = String(statusCode).startsWith('4') ? LOG_TYPE.FAIL : LOG_TYPE.ERROR;

    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
