const Sequelize = require('sequelize');
const logger = require('../middleware/log/logger');
const env = process.env.NODE_ENV || 'development';
const { DATABASE } = require('../common/messages');
const { LOG_TYPE } = require('../constants/logger.constants');
const { STATUS_CODE } = require('../constants/app.constants');
const config = require('../config/config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: process.env.PG_HOST,
  dialect: config.dialect,
  pool: {
    max: parseInt(process.env.PG_MAXCONN),
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log(DATABASE.CONNECTION.SUCCESS);
  })
  .catch((error) => {
    logger(LOG_TYPE.ERROR, false, STATUS_CODE.SURVICE_UNAVAILABLE, DATABASE.CONNECTION.FAILED(error));
    console.error(DATABASE.CONNECTION.FAILED(error));
    process.exit();
  });

module.exports = sequelize;
