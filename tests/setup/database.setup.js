const { Sequelize, DataTypes } = require('sequelize');

// in memory sqlite database for testing
const testSequelize = new Sequelize('sqlite::memory:', {
  logging: false,
});

// task model
const Task = testSequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['isCompleted'],
      },
      {
        fields: ['isArchived'],
      },
    ],
  },
);

const setupTestDatabase = async () => {
  try {
    await testSequelize.authenticate();
    console.log('Test database connection established successfully.');

    await testSequelize.sync({ force: true });
    console.log('Test database synced successfully.');

    return { testSequelize, Task };
  } catch (error) {
    console.error('Unable to setup test database:', error);
    throw error;
  }
};

const cleanupTestDatabase = async () => {
  try {
    await testSequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    throw error;
  }
};

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  Task,
  testSequelize,
};
