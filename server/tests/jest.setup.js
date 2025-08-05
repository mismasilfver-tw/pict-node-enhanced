/**
 * Jest setup file for server tests
 */

// Set timeout for all tests to 10 seconds
jest.setTimeout(10000);

// Silence console logs during tests unless in verbose mode
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    // Keep error and warn for debugging
    error: console.error,
    warn: console.warn,
  };
}

// Mock the performance hooks
global.performance = {
  now: jest.fn(() => 1000),
};

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
