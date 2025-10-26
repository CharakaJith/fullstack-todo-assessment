module.exports = {
  testTimeout: 30000,
  testMatch: ['**/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup/setup.js'],
  globalTeardown: '<rootDir>/tests/e2e/setup/teardown.js',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports/e2e',
        filename: 'e2e-report.html',
      },
    ],
  ],
};
