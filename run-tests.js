#!/usr/bin/env node

// Simple script to run Jest tests
const { execSync } = require("child_process");

try {
  // Run Jest with a simpler configuration
  execSync("npx jest --config=jest.config.js", {
    stdio: "inherit",
    env: {
      ...process.env,
      PICT_NODE_TEST: "true",
    },
  });
} catch (error) {
  // Jest will throw an error if tests fail, but we don't want to crash the script
  process.exit(error.status || 1);
}
