const sequelize = require('./database');
const { DATABASE } = require('../common/messages');
const { APP_ENV } = require('../constants/app.constants');

async function initialize() {
  try {
    // Sync models with the database
    const syncOptions = process.env.NODE_ENV === APP_ENV.DEV ? { force: true } : {};
    await sequelize.sync(syncOptions);

    console.log(DATABASE.SYNC.SUCCESS);
  } catch (error) {
    console.error(DATABASE.SYNC.FAILED(error));
  }
}

module.exports = initialize;
