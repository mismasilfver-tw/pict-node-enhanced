import fsp from "fs/promises";
import path from "path";

// Use a CommonJS compatible approach for getting the directory path
// This avoids the need for import.meta.url which requires ES modules
const TEST_DIR_PATH = process.cwd() + "/test";

const types = Object.freeze({
  null: null,
  undefined: undefined,
  boolean: true,
  number: 1,
  bigint: BigInt(Number.MAX_SAFE_INTEGER),
  string: "string",
  symbol: Symbol("symbol"),
  array: [],
  record: {},
  function: () => {},
});

export function EXCLUDE_TYPES(exclude: Array<keyof typeof types>) {
  return Object.keys(types)
    .filter((key) => {
      return !exclude.includes(key as keyof typeof types);
    })
    .map((key) => (types as any)[key]) as unknown[];
}

export const NOT_NULL_TYPES = EXCLUDE_TYPES(["null"]);
export const NOT_UNDEFINED_TYPES = EXCLUDE_TYPES(["undefined"]);
export const NOT_BOOLEAN_TYPES = EXCLUDE_TYPES(["boolean"]);
export const NOT_NUMBER_TYPES = EXCLUDE_TYPES(["number"]);
export const NOT_BIGINT_TYPES = EXCLUDE_TYPES(["bigint"]);
export const NOT_STRING_TYPES = EXCLUDE_TYPES(["string"]);
export const NOT_SYMBOL_TYPES = EXCLUDE_TYPES(["symbol"]);
export const NOT_RECORD_TYPES = EXCLUDE_TYPES(["record"]);
export const NOT_FUNCTION_TYPES = EXCLUDE_TYPES(["function"]);
export const NOT_ARRAY_TYPES = EXCLUDE_TYPES(["array"]);
export const ALL_TYPES = EXCLUDE_TYPES([]);
export const NOT_PROPERTY_KEY_TYPES = EXCLUDE_TYPES([
  "string",
  "symbol",
  "number",
]);

export async function getTestModelContent(fileName: string) {
  const buffer = await fsp.readFile(
    path.join(TEST_DIR_PATH, `./models/${fileName}`),
  );

  return buffer.toString();
}

/**
 * Helper function to test for errors in a way that's compatible with both Jest 29 and Jest 30
 * This replaces the deprecated toThrowError matcher
 */
export function expectToThrowError(fn: () => any, errorMessage: string) {
  try {
    fn();
    // If we get here, the function didn't throw
    expect(true).toBe(false); // Force a test failure
  } catch (error: any) {
    expect(error.message).toContain(errorMessage);
  }
}

/**
 * Helper function to test for errors in async functions
 * This replaces the deprecated toThrowError matcher for async functions
 */
export async function expectAsyncToThrowError(
  fn: () => Promise<any>,
  errorMessage: string,
) {
  try {
    await fn();
    // If we get here, the function didn't throw
    expect(true).toBe(false); // Force a test failure
  } catch (error: any) {
    try {
      expect(error.message).toContain(errorMessage);
    } catch (e) {
      // Provide more detailed error information
      console.error(`Expected error message to contain: "${errorMessage}"`);
      console.error(`Actual error message: "${error.message}"`);
      throw e;
    }
  }
}
