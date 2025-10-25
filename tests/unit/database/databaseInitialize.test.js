const initialize = require('../../../database/initialze');
const sequelize = require('../../../database/database');
const { APP_ENV, STATUS_CODE } = require('../../../constants/app.constants');
const { DATABASE } = require('../../../common/messages');

jest.mock('../../../database/database', () => ({
  sync: jest.fn(),
}));

describe('Database Initialization', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call sync with { force: true } in development env', async () => {
    process.env.NODE_ENV = APP_ENV.DEV;
    console.log = jest.fn();

    sequelize.sync.mockResolvedValue('synced');

    await initialize();

    expect(sequelize.sync).toHaveBeenCalledWith({ force: true });
    expect(console.log).toHaveBeenCalledWith(DATABASE.SYNC.SUCCESS);
  });

  it('should call sync with empty options in non-development env', async () => {
    process.env.NODE_ENV = 'test';
    console.log = jest.fn();

    sequelize.sync.mockResolvedValue('synced');

    await initialize();

    expect(sequelize.sync).toHaveBeenCalledWith({});
    expect(console.log).toHaveBeenCalledWith(DATABASE.SYNC.SUCCESS);
  });

  it('should log error when sync fails', async () => {
    process.env.NODE_ENV = APP_ENV.DEV;
    const error = new Error('fail');
    sequelize.sync.mockRejectedValue(error);
    console.error = jest.fn();

    await initialize();

    expect(console.error).toHaveBeenCalledWith(DATABASE.SYNC.FAILED(error));
  });
});
