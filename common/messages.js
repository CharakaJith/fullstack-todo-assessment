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
};
