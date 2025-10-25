module.exports = {
  ...require('./jest.config.js'),
  testMatch: ['**/tests/unit/**/*.test.js'],
  testTimeout: 10000,
};
