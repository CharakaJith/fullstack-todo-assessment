module.exports = {
  // cors
  CORS: {
    INVALID: 'Not allowed by CORS!',
  },

  // database initialization
  DATABASE: {
    SYNC: {
      SUCCESS: 'Database synced successfully.',
      FAILED: (error) => `Failed to sync database: ${error.message}`,
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
    },
  },

  // repository layer errors
  REPO: {
    FAILED: {
      INSERT: (entity, error) => `Failed to create ${entity}: ${error.message}`,
      GET: {
        BY_ID: (entity, error) => `Failed to retrieve ${entity} by ID: ${error.message}`,
      },
      UPDATE: (entity, error) => `Failed to update ${entity}: ${error.message}`,
    },
  },
};
