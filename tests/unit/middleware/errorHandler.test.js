const errorHandler = require('../../../middleware/errorHandler');
const logger = require('../../../middleware/log/logger');
const { APP_ENV, STATUS_CODE } = require('../../../constants/app.constants');

jest.mock('../../../middleware/log/logger', () => jest.fn());

describe('Global Error Handler', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    process.env.NODE_ENV = APP_ENV.DEV;
  });

  // provide stack in dev environment
  it('should log error and send proper response with stack in development env', () => {
    const error = {
      status: 'error',
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: 'Invalid request',
      stack: 'Error stack trace',
    };
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(logger).toHaveBeenCalledWith('error', false, 400, 'Invalid request', mockReq);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      response: {
        status: 400,
        data: { message: 'Invalid request' },
        stack: 'Error stack trace',
      },
    });
  });

  // hide stack in qa/staging/production environments
  it('should hide stack trace in production env', () => {
    process.env.NODE_ENV = APP_ENV.PROD;

    const error = {
      status: 'fail',
      statusCode: STATUS_CODE.SERVER_ERROR,
      message: 'Server crashed',
      stack: 'stack trace',
    };
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      response: {
        status: 500,
        data: { message: 'Server crashed' },
        stack: undefined,
      },
    });
  });

  // set status code to 500 if not provided
  it('should default to 500 if no statusCode is provided', () => {
    const error = { message: 'Something broke' };
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
