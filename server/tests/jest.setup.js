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

// Mock pict and strings modules for integration tests
jest.mock('../../lib/index', () => {
  // Create mock implementations with stats methods
  const mockPict = jest.fn().mockImplementation(() => {
    return {
      testCases: ['test1', 'test2'],
      count: 2
    };
  });
  
  mockPict.stats = jest.fn().mockImplementation(() => {
    return {
      combinations: 100,
      generatedTests: 10,
      generationTime: 0.5,
      generationTimeNodeJs: 0.1
    };
  });
  
  // For strings, we need to create a function that can be called directly
  // and also has a stats method
  const mockStringsFunction = jest.fn().mockImplementation(() => {
    return {
      testCases: ['test1', 'test2'],
      count: 2
    };
  });
  
  mockStringsFunction.stats = jest.fn().mockImplementation(() => {
    return {
      combinations: 100,
      generatedTests: 10,
      generationTime: 0.5,
      generationTimeNodeJs: 0.1
    };
  });
  
  return {
    pict: mockPict,
    strings: mockStringsFunction
  };
});

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
