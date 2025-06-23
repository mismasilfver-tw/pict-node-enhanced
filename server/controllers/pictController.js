const { pict, strings } = require("../../lib/index");
const path = require("path");
const fs = require("fs");

/**
 * Generate test cases based on the provided model
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateTestCases = async (req, res) => {
  try {
    const { model, options, constraints } = req.body;

    if (!model || !Array.isArray(model)) {
      return res.status(400).json({
        error: "Invalid model format. Model must be an array of parameters.",
      });
    }

    // If constraints are provided, use the strings API which supports constraints
    let cases;
    if (constraints && constraints.length > 0) {
      try {
        // First, convert the model to use only string values as required by the strings API
        const stringModel = model.map((param) => ({
          key: param.key,
          // Convert all values to strings, ensuring proper type handling
          values: param.values.map((v) => {
            if (v === null || v === undefined) return "";
            return String(v);
          }),
        }));

        // Get all parameter names for validation
        const parameterNames = stringModel.map((param) => param.key);

        // Create a mapping of parameter values for validation
        const paramValueMap = {};
        stringModel.forEach((param) => {
          paramValueMap[param.key] = param.values;
        });

        // Process and validate each constraint
        const formattedConstraints = [];

        for (const constraint of constraints) {
          // Clean up the constraint
          let processedConstraint = constraint.trim();

          // Remove any existing semicolons at the end
          processedConstraint = processedConstraint.replace(/;\s*$/, "");

          // Validate that the constraint references valid parameters
          let isValid = false;
          for (const paramName of parameterNames) {
            if (processedConstraint.includes(`[${paramName}]`)) {
              isValid = true;
              break;
            }
          }

          if (!isValid) {
            throw new Error(
              `Constraint references unknown parameter: ${processedConstraint}`
            );
          }

          // Ensure proper spacing around operators for better parsing
          processedConstraint = processedConstraint
            .replace(/([<>])=/g, "$1= ") // Handle >=, <=
            .replace(/([^<>])=([^=])/g, "$1 = $2") // Handle =
            .replace(/<>/g, " <> ") // Handle <>
            .replace(/\s{2,}/g, " "); // Normalize spaces

          // Add semicolon at the end
          formattedConstraints.push(`${processedConstraint};`);
        }

        // Use the strings API with properly formatted constraints
        cases = await strings(
          {
            model: stringModel,
            constraints: formattedConstraints,
          },
          options || {}
        );
      } catch (error) {
        console.error("Error processing constraints:", error);
        throw error;
      }
    } else {
      // Use the standard pict API if no constraints
      cases = await pict({ model }, options || {});
    }

    return res.json({
      success: true,
      cases,
      count: cases.length,
    });
  } catch (error) {
    console.error("Error generating test cases:", error);
    return res.status(500).json({
      error: "Failed to generate test cases",
      message: error.message,
    });
  }
};

/**
 * Get example models for demonstration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getExamples = (req, res) => {
  try {
    const examples = [
      {
        name: "Simple Order System",
        model: [
          {
            key: "location",
            values: ["Poland", "Lithuania", "Germany", "USA"],
          },
          {
            key: "customer",
            values: ["Individuals", "Companies", "Partners"],
          },
          {
            key: "time",
            values: ["05:00", "11:99", "15:00", "21:30", "23:59"],
          },
          {
            key: "paymentSystem",
            values: ["VISA", "MasterCard", "PayPal", "WebMoney", "Qiwi"],
          },
          {
            key: "product",
            values: [{ id: 1732 }, { id: 319 }, { id: 872 }, { id: 650 }],
          },
          {
            key: "discount",
            values: [true, false],
          },
        ],
      },
      {
        name: "File System Example",
        model: [
          {
            key: "type",
            values: ["Primary", "Logical", "Single"],
          },
          {
            key: "size",
            values: ["10", "100", "500", "1000", "5000", "10000", "40000"],
          },
          {
            key: "fileSystem",
            values: ["FAT", "FAT32", "NTFS"],
          },
        ],
      },
    ];

    return res.json({ examples });
  } catch (error) {
    console.error("Error fetching examples:", error);
    return res.status(500).json({
      error: "Failed to fetch examples",
      message: error.message,
    });
  }
};

module.exports = {
  generateTestCases,
  getExamples,
};
