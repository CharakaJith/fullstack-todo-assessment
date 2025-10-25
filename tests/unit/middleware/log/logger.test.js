const logger = require('../../../../middleware/log/logger');
const loggerIndex = require('../../../../middleware/log/index');
const { LOG_TYPE } = require('../../../../constants/logger.constants');

jest.mock('../../../../middleware/log/index', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

describe('Logger Utility', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      originalUrl: '/api/v1/test',
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:8000'),
      method: 'POST',
      body: { key: 'value' },
    };
    jest.clearAllMocks();
  });

  it('should call loggerIndex.info for INFO log type', () => {
    logger(LOG_TYPE.INFO, true, 200, 'Operation successful', mockReq);

    expect(loggerIndex.info).toHaveBeenCalled();
    expect(loggerIndex.debug).not.toHaveBeenCalled();
    expect(loggerIndex.error).not.toHaveBeenCalled();
  });

  it('should call loggerIndex.debug for DEBUG log type', () => {
    logger(LOG_TYPE.DEBUG, true, 200, 'Debug log', mockReq);

    expect(loggerIndex.debug).toHaveBeenCalled();
  });

  it('should call loggerIndex.error for ERROR log type', () => {
    logger(LOG_TYPE.ERROR, false, 500, 'Server crash', mockReq);

    expect(loggerIndex.error).toHaveBeenCalled();
  });

  it('should default to loggerIndex.error for unknown log types', () => {
    logger(LOG_TYPE.UNKNOWN, false, 500, 'Unknown log type', mockReq);

    expect(loggerIndex.error).toHaveBeenCalled();
  });

  it('should include stack trace if provided', () => {
    logger(LOG_TYPE.ERROR, false, 500, 'Error occurred', mockReq, 'stack trace');

    const logCall = loggerIndex.error.mock.calls[0][0];
    expect(JSON.stringify(logCall)).toContain('stack trace');
  });

  it('should handle missing request safely', () => {
    logger(LOG_TYPE.INFO, true, 200, 'No request object');

    expect(loggerIndex.info).toHaveBeenCalled();
  });
});
