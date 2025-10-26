const generateTestData = {
  task: (overrides = {}) => ({
    title: `Test Task ${Date.now()}`,
    description: `Test Description ${Date.now()}`,
    ...overrides,
  }),

  user: (overrides = {}) => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    ...overrides,
  }),
};

const invalidData = {
  task: {
    emptyTitle: {
      title: '',
      description: 'Valid description',
    },
    missingTitle: {
      description: 'Missing title',
    },
    longTitle: {
      title: 'A'.repeat(1000),
      description: 'Valid description',
    },
    specialCharacters: {
      title: 'Task @#$%^&*()',
      description: 'Description 🚀✅🌟',
    },
  },
};

module.exports = { generateTestData, invalidData };
