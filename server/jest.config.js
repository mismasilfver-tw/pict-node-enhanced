/**
 * Jest configuration for server-side tests
 */
module.exports = {
  // The root directory for tests
  rootDir: '.',
  
  // The test environment to use
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Setup file to run before tests
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    './controllers/**/*.js',
    './utils/**/*.js',
    './routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  },
  
  // Test results processor
  testResultsProcessor: './tests/results-processor.js',
  
  // Verbose output
  verbose: true
};
