const { Sequelize, DataTypes } = require('sequelize');

// Create in-memory SQLite database
const testSequelize = new Sequelize('sqlite::memory:', {
  logging: false,
});

// Define Task model
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
      defaultValue: 1,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
);

// Mock the models module - define everything inside the mock factory
jest.mock('../../../models', () => {
  const { Sequelize: Seq, DataTypes: DT } = require('sequelize');
  const mockSequelize = new Seq('sqlite::memory:', { logging: false });

  const MockTask = mockSequelize.define(
    'Task',
    {
      id: {
        type: DT.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DT.INTEGER,
        defaultValue: 1,
      },
      title: {
        type: DT.STRING,
        allowNull: false,
      },
      description: {
        type: DT.TEXT,
        allowNull: true,
      },
      isCompleted: {
        type: DT.BOOLEAN,
        defaultValue: false,
      },
      isArchived: {
        type: DT.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'tasks',
      timestamps: true,
    },
  );

  return {
    Task: MockTask,
    Sequelize: Seq,
    DataTypes: DT,
  };
});

// Mock fieldValidator
jest.mock('../../../util/fieldValidator', () => ({
  validate_string: jest.fn((value, field) => {
    if (!value || value.trim() === '') {
      return { fields: field, message: `The '${field}' field is required.` };
    }
    return 1;
  }),
  validate_number: jest.fn((value, field) => {
    if (!value || isNaN(value)) {
      return { fields: field, message: `The '${field}' must be a number.` };
    }
    return 1;
  }),
  validate_boolean: jest.fn((value, field) => {
    if (typeof value !== 'boolean') {
      return { fields: field, message: `The '${field}' must be a boolean.` };
    }
    return 1;
  }),
}));

// Mock logger
jest.mock('../../../middleware/log/logger', () => jest.fn());

const setupTestDatabase = async () => {
  await testSequelize.authenticate();
  await testSequelize.sync({ force: true });
  return { Task };
};

const cleanupTestDatabase = async () => {
  await testSequelize.close();
};

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  Task,
  testSequelize,
};
