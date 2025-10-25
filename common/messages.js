module.exports = {
  // cors
  CORS: {
    INVALID: 'Not allowed by CORS!',
  },

  // database initialization
  DATABASE: {
    CONNECTION: {
      SUCCESS: 'Connection has been established successfully.',
      FAILED: (error) => `Unable to connect to the database: ${error.message}`,
    },
  },

  // field validation
  VALIDATE: {
    PARAM: {
      EMPTY: (field) => `The '${field}' field is required.`,
      INVALID: (field) => `Invalid format for '${field}'.`,
    },
  },

  // response payload
  RESPONSE: {
    TASK: {
      NOT_FOUND: 'Invalid task ID',
      UPDATE_FAILED: 'Failed to update the task',
    },
  },

  // repository layer errors
  REPO: {
    FAILED: {
      INSERT: (entity, error) => `Failed to create ${entity}: ${error.message}`,
      GET: {
        All: (entity, error) => `Failed to get all ${entity}: ${error.message}`,
        BY_ID: (entity, error) => `Failed to retrieve ${entity} by ID: ${error.message}`,
      },
      UPDATE: (entity, error) => `Failed to update ${entity}: ${error.message}`,
    },
  },
};
