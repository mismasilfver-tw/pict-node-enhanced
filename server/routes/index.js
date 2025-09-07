const express = require("express");
const router = express.Router();
const {
  generateTestCases,
  getExamples,
} = require("../controllers/pictController");
const { createEnhancedStatistics } = require("../utils/statisticsCalculations");

// Route to generate test cases
router.post("/generate", generateTestCases);

// Route to get example models
router.get("/examples", getExamples);

// Route to generate statistics only
router.post("/stats", async (req, res) => {
  try {
    const { model, options, constraints } = req.body;

    if (!model || !Array.isArray(model)) {
      return res.status(400).json({
        error: "Invalid model format. Model must be an array of parameters.",
      });
    }

    let statistics = null;

    // If constraints are provided, use the strings API
    if (constraints && constraints.length > 0) {
      try {
        // Convert model to use only string values as required by strings API
        const stringModel = model.map((param) => ({
          key: param.key,
          values: param.values.map((v) => {
            if (v === null || v === undefined) return "";
            return String(v);
          }),
        }));

        // Process constraints similar to generateTestCases
        const parameterNames = stringModel.map((param) => param.key);
        const paramValueMap = {};
        stringModel.forEach((param) => {
          paramValueMap[param.key] = param.values;
        });

        const formattedConstraints = [];
        for (const constraint of constraints) {
          let processedConstraint = constraint.trim();
          processedConstraint = processedConstraint.replace(/;\s*$/, "");

          let isValid = false;
          for (const paramName of parameterNames) {
            if (processedConstraint.includes(`[${paramName}]`)) {
              isValid = true;
              break;
            }
          }

          if (!isValid) {
            throw new Error(
              `Constraint references unknown parameter: ${processedConstraint}`,
            );
          }

          processedConstraint = processedConstraint
            .replace(/([<>])=/g, "$1= ")
            .replace(/([^<>])=([^=])/g, "$1 = $2")
            .replace(/<>/g, " <> ")
            .replace(/\s{2,}/g, " ");

          formattedConstraints.push(`${processedConstraint};`);
        }

        // Use strings.stats API
        const { strings } = require("../../lib/index");
        statistics = await strings.stats(
          {
            model: stringModel,
            constraints: formattedConstraints,
          },
          options || {},
        );
      } catch (error) {
        console.error("Error processing constraints for statistics:", error);
        throw error;
      }
    } else {
      // Use standard pict.stats API if no constraints
      const { pict } = require("../../lib/index");
      statistics = await pict.stats({ model }, options || {});
    }

    // Create enhanced statistics with additional metrics
    const orderValue =
      options && typeof options.order === "number" ? options.order : 2;
    statistics = createEnhancedStatistics(statistics, model, {
      order: orderValue,
    });

    return res.json({
      success: true,
      statistics,
    });
  } catch (error) {
    console.error("Error generating statistics:", error);
    return res.status(500).json({
      error: "Failed to generate statistics",
      message: error.message,
    });
  }
});

module.exports = router;
