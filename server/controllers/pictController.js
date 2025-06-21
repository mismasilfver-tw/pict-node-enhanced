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
      // Convert all values to strings for the strings API
      const stringModel = model.map((param) => ({
        key: param.key,
        values: param.values.map((v) => String(v)),
      }));

      cases = await strings(
        {
          model: stringModel,
          constraints,
        },
        options || {}
      );
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
