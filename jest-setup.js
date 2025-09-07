const { toIncludeSameMembers, toIncludeAnyMembers } = require("jest-extended");

expect.extend({ toIncludeSameMembers, toIncludeAnyMembers });

// Silence specific noisy console.error logs that are expected in tests
const originalConsoleError = console.error;

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((...args) => {
    const firstArg = args[0];
    if (
      typeof firstArg === "string" &&
      (firstArg.includes('Error while calling "pict" function.') ||
        firstArg.includes('Error while calling "native" function.'))
    ) {
      // Swallow these expected error logs to keep test output clean
      return;
    }
    // Delegate other errors to the original console.error
    originalConsoleError(...args);
  });
});

afterAll(() => {
  if (console.error && console.error.mock && console.error.mockRestore) {
    console.error.mockRestore();
  }
});
