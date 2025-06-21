// Simple test script to check if all required modules are available
try {
  console.log("Testing required modules...");

  // Test Express
  const express = require("express");
  console.log("✓ Express loaded successfully");

  // Test CORS
  const cors = require("cors");
  console.log("✓ CORS loaded successfully");

  // Test body-parser
  const bodyParser = require("body-parser");
  console.log("✓ body-parser loaded successfully");

  // Test path (built-in)
  const path = require("path");
  console.log("✓ path loaded successfully");

  // Test if routes file exists
  try {
    const routes = require("./server/routes");
    console.log("✓ Routes loaded successfully");
  } catch (error) {
    console.error("✗ Error loading routes:", error.message);
  }

  // Test if PICT library is accessible
  try {
    const pict = require("./lib/index");
    console.log("✓ PICT library loaded successfully");
  } catch (error) {
    console.error("✗ Error loading PICT library:", error.message);
  }

  console.log("All tests completed");
} catch (error) {
  console.error("Error during module testing:", error.message);
}
