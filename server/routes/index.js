const express = require("express");
const router = express.Router();
const {
  generateTestCases,
  getExamples,
} = require("../controllers/pictController");

// Route to generate test cases
router.post("/generate", generateTestCases);

// Route to get example models
router.get("/examples", getExamples);

module.exports = router;
