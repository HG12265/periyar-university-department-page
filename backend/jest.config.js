module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/dist/tests/**/*.test.js'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/dist/tests/mocks/uuid.js',
    '^jose$': '<rootDir>/dist/tests/mocks/jose.js',
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
