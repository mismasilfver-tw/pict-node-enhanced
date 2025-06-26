#!/usr/bin/env node

// Simple script to run Jest tests with more debugging information
const { spawnSync } = require("child_process");

console.log("Starting Jest test debug...");
console.log("Current working directory:", process.cwd());

try {
  // Run Jest with verbose output
  const result = spawnSync(
    "node",
    [
      "--experimental-vm-modules",
      "node_modules/jest/bin/jest.js",
      "--no-cache",
      "--verbose",
      "--detectOpenHandles",
      "test/alias.spec.ts", // Just run a single test file
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PICT_NODE_TEST: "true",
      },
    },
  );

  console.log("Jest process exited with code:", result.status);
  if (result.error) {
    console.error("Error running Jest:", result.error);
  }

  process.exit(result.status || 0);
} catch (error) {
  console.error("Exception running Jest:", error);
  process.exit(1);
}
