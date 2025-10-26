const { DATABASE } = require('../../../common/messages');
const { LOG_TYPE } = require('../../../constants/logger.constants');
const { STATUS_CODE } = require('../../../constants/app.constants');

jest.mock('sequelize');
jest.mock('../../../middleware/log/logger');

// mock config
jest.mock('../../../config/config', () => ({
  development: {
    database: 'testdb',
    username: 'testuser',
    password: 'testpass',
    dialect: 'postgres',
  },
  test: {
    database: 'testdb',
    username: 'testuser',
    password: 'testpass',
    dialect: 'postgres',
  },
}));

const Sequelize = require('sequelize');
const logger = require('../../../middleware/log/logger');

describe('Database Connection', () => {
  let originalEnv;
  let originalPgHost;
  let originalPgMaxConn;
  let sequelizeMock;

  beforeEach(() => {
    // store environment variables
    originalEnv = process.env.NODE_ENV;
    originalPgHost = process.env.PG_HOST;
    originalPgMaxConn = process.env.PG_MAXCONN;

    // set test variables
    process.env.NODE_ENV = 'test';
    process.env.PG_HOST = 'localhost';
    process.env.PG_MAXCONN = '5';

    sequelizeMock = {
      authenticate: jest.fn(),
    };
    Sequelize.mockImplementation(() => sequelizeMock);

    console.log = jest.fn();
    console.error = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalPgHost) {
      process.env.PG_HOST = originalPgHost;
    } else {
      delete process.env.PG_HOST;
    }
    if (originalPgMaxConn) {
      process.env.PG_MAXCONN = originalPgMaxConn;
    } else {
      delete process.env.PG_MAXCONN;
    }
  });

  // if connection is success
  it('logs success message when authenticate succeeds', async () => {
    sequelizeMock.authenticate.mockResolvedValue(true);

    await jest.isolateModulesAsync(async () => {
      require('../../../database/connection');
    });

    await new Promise(process.nextTick);

    expect(sequelizeMock.authenticate).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(DATABASE.CONNECTION.SUCCESS);
  });

  // if connection fails
  it('logs error and calls logger when authenticate fails', async () => {
    const error = new Error('Connection failed');
    sequelizeMock.authenticate.mockRejectedValue(error);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    await jest.isolateModulesAsync(async () => {
      require('../../../database/connection');
    });

    await new Promise(process.nextTick);

    const expectedErrorMessage = DATABASE.CONNECTION.FAILED(error);

    expect(sequelizeMock.authenticate).toHaveBeenCalled();
    expect(logger).toHaveBeenCalledWith(LOG_TYPE.ERROR, false, STATUS_CODE.SURVICE_UNAVAILABLE, expectedErrorMessage);
    expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
    expect(mockExit).toHaveBeenCalled();

    mockExit.mockRestore();
  });
});
