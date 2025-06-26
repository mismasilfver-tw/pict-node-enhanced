// Type definitions for Jest global functions
declare global {
  // Jest globals
  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: () => void | Promise<void>) => void;
  const expect: any;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;

  // Jest aliases
  const it: typeof test;
  const fit: typeof test;
  const xit: typeof test;
}

export {};
