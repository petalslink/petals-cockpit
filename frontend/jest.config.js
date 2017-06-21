module.exports = {
  preset: 'jest-preset-angular',
  setupTestFrameworkScriptFile: '<rootDir>/src/setup-jest.ts',
  transformIgnorePatterns: ['node_modules/(?!@ngrx|angular2-notifications)'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/environment/**',
    '!src/**/*.mock.ts',
    '!src/mocks/**',
    '!src/**/*.d.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/environment',
    '<rootDir>/src/mocks',
  ],
};
