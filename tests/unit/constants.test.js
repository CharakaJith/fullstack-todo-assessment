const { APP_ENV, STATUS_CODE, CONNECTION } = require('../../constants/app.constants');
const { ENTITY } = require('../../constants/entity.constants');
const { LOG_TYPE } = require('../../constants/logger.constants');

describe('All Constants', () => {
  it('should have correct environment values', () => {
    expect(APP_ENV.DEV).toBe('development');
    expect(APP_ENV.QA).toBe('qa');
    expect(APP_ENV.STAGE).toBe('staging');
    expect(APP_ENV.PROD).toBe('production');
  });

  it('should have correct status codes', () => {
    expect(STATUS_CODE.OK).toBe(200);
    expect(STATUS_CODE.CREATED).toBe(201);
    expect(STATUS_CODE.NO_CONTENT).toBe(204);
    expect(STATUS_CODE.BAD_REQUEST).toBe(400);
    expect(STATUS_CODE.UNAUTHORIZED).toBe(401);
    expect(STATUS_CODE.FORBIDDEN).toBe(403);
    expect(STATUS_CODE.NOT_FOUND).toBe(404);
    expect(STATUS_CODE.CONFLICT).toBe(409);
    expect(STATUS_CODE.GONE).toBe(410);
    expect(STATUS_CODE.UNPROCESSABLE).toBe(422);
    expect(STATUS_CODE.SERVER_ERROR).toBe(500);
    expect(STATUS_CODE.BAD_GATEWAY).toBe(502);
    expect(STATUS_CODE.TIME_OUT).toBe(504);
  });

  it('should have correct connection error codes', () => {
    expect(CONNECTION.ABORT).toBe('ECONNABORTED');
    expect(CONNECTION.NOTFOUND).toBe('ENOTFOUND');
    expect(CONNECTION.REFUSED).toBe('ECONNREFUSED');
  });
});

describe('Entity Constants', () => {
  it('should have correct entity names', () => {
    expect(ENTITY.USER).toBe('Users');
    expect(ENTITY.TASK).toBe('Tasks');
  });
});

describe('Logger Constants', () => {
  it('should have correct log types', () => {
    expect(LOG_TYPE.INFO).toBe('info');
    expect(LOG_TYPE.DEBUG).toBe('debug');
    expect(LOG_TYPE.FAIL).toBe('fail');
    expect(LOG_TYPE.ERROR).toBe('error');
  });
});
