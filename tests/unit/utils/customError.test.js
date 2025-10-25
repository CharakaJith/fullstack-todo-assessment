const CustomError = require('../../../util/customError');
const { LOG_TYPE } = require('../../../constants/logger.constants');

describe('CustomError Module', () => {
  it('should create a FAIL error for 4xx status codes', () => {
    const err = new CustomError('Bad request', 400);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe(LOG_TYPE.FAIL);
    expect(err.isOperational).toBe(true);
    expect(err.stack).toBeDefined();
  });

  it('should create an ERROR for 5xx status codes', () => {
    const err = new CustomError('Server error', 500);

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe(LOG_TYPE.ERROR);
  });

  it('should handle non-4xx/5xx codes as ERROR', () => {
    const err = new CustomError('Other code', 300);

    expect(err.status).toBe(LOG_TYPE.ERROR);
  });
});
