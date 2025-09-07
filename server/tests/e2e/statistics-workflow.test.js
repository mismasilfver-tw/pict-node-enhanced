/**
 * End-to-End test for statistics workflow
 *
 * This test simulates a complete user workflow:
 * 1. Generate test cases with statistics
 * 2. Fetch detailed statistics separately
 * 3. Verify statistics with different order values
 */
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("../../routes");

// We need to mock the actual PICT calls since we can't run the binary in tests
// But we want to make the mocks more realistic for E2E testing
jest.mock("../../../lib/index", () => {
  // Generate realistic test cases based on the model
  const generateTestCases = (model) => {
    const result = [];
    const params = model.model || [];

    // For simple models, generate a more realistic set of test cases
    if (params.length === 2) {
      const param1 = params[0];
      const param2 = params[1];

      for (const val1 of param1.values) {
        for (const val2 of param2.values) {
          const testCase = {};
          testCase[param1.key] = val1;
          testCase[param2.key] = val2;
          result.push(testCase);
        }
      }
      return result;
    }

    // Default fallback for more complex models
    return [
      { param1: "value1", param2: "value1", param3: "value1" },
      { param1: "value1", param2: "value2", param3: "value2" },
      { param1: "value2", param2: "value1", param3: "value2" },
      { param1: "value2", param2: "value2", param3: "value1" },
    ];
  };

  // Generate realistic statistics based on the model and options
  const generateStatistics = (model, options = {}) => {
    const params = model.model || [];
    const order = options.order || 2;

    // Calculate a realistic number of combinations based on the model
    let combinations = 0;
    if (params.length >= order) {
      if (order === 2 && params.length >= 2) {
        // For pairwise, calculate actual combinations
        for (let i = 0; i < params.length - 1; i++) {
          for (let j = i + 1; j < params.length; j++) {
            combinations += params[i].values.length * params[j].values.length;
          }
        }
      } else {
        // For higher orders, use a simple approximation
        combinations = Math.pow(3, order) * (params.length - order + 1);
      }
    }

    // Calculate a realistic number of test cases needed
    const generatedTests = Math.max(4, Math.ceil(Math.log2(combinations) * 2));

    return {
      combinations,
      generatedTests,
      generationTime: 0.01 * params.length,
      generationTimeNodeJs: 5 * params.length,
      // These will be added by our enhanced statistics logic
    };
  };

  return {
    pict: jest.fn((model, options) =>
      Promise.resolve(generateTestCases(model, options)),
    ),
    strings: jest.fn((model, options) =>
      Promise.resolve(generateTestCases(model, options)),
    ),
    pict: {
      stats: jest.fn((model, options) =>
        Promise.resolve(generateStatistics(model, options)),
      ),
    },
    strings: {
      stats: jest.fn((model, options) =>
        Promise.resolve(generateStatistics(model, options)),
      ),
    },
  };
});

// Create a test app
const app = express();
app.use(bodyParser.json());
app.use("/api", routes);

describe("Statistics E2E Workflow Tests", () => {
  // Test model representing a real-world scenario
  const orderSystemModel = [
    {
      key: "location",
      values: ["Poland", "Lithuania", "Germany", "USA"],
    },
    {
      key: "customer",
      values: ["Individuals", "Companies", "Partners"],
    },
    {
      key: "paymentSystem",
      values: ["VISA", "MasterCard", "PayPal", "WebMoney"],
    },
  ];

  const constraints = ['[location] = "USA" => [paymentSystem] <> "WebMoney"'];

  test("Complete statistics workflow with different order values", async () => {
    // Step 1: Generate test cases with 2-way (pairwise) statistics
    const generateResponse = await request(app)
      .post("/api/generate")
      .send({
        model: orderSystemModel,
        constraints,
        options: { order: 2 },
      });

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body).toHaveProperty("success", true);
    expect(generateResponse.body).toHaveProperty("cases");
    expect(generateResponse.body).toHaveProperty("statistics");
    expect(generateResponse.body.statistics).toHaveProperty("order", 2);
    expect(generateResponse.body.statistics).toHaveProperty(
      "coveragePercentage",
      100,
    );

    // Store the number of test cases generated for pairwise
    const pairwiseTestCount = generateResponse.body.cases.length;

    // Step 2: Get detailed statistics for 2-way (pairwise)
    const statsResponse2Way = await request(app)
      .post("/api/stats")
      .send({
        model: orderSystemModel,
        constraints,
        options: { order: 2 },
      });

    expect(statsResponse2Way.status).toBe(200);
    expect(statsResponse2Way.body).toHaveProperty("statistics");
    expect(statsResponse2Way.body.statistics).toHaveProperty("order", 2);
    expect(statsResponse2Way.body.statistics).toHaveProperty("theoreticalMax");
    expect(statsResponse2Way.body.statistics).toHaveProperty(
      "constraintReduction",
    );

    // Step 3: Get statistics for 3-way combinations
    const statsResponse3Way = await request(app)
      .post("/api/stats")
      .send({
        model: orderSystemModel,
        constraints,
        options: { order: 3 },
      });

    expect(statsResponse3Way.status).toBe(200);
    expect(statsResponse3Way.body.statistics).toHaveProperty("order", 3);

    // Step 4: Generate test cases with 3-way statistics
    const generate3WayResponse = await request(app)
      .post("/api/generate")
      .send({
        model: orderSystemModel,
        constraints,
        options: { order: 3 },
      });

    expect(generate3WayResponse.status).toBe(200);
    expect(generate3WayResponse.body).toHaveProperty("statistics");
    expect(generate3WayResponse.body.statistics).toHaveProperty("order", 3);

    // Step 5: Verify that 3-way testing typically requires more test cases than 2-way
    const threewayTestCount = generate3WayResponse.body.cases.length;

    // This is a fundamental property of combinatorial testing:
    // Higher order coverage requires more test cases
    expect(threewayTestCount).toBeGreaterThanOrEqual(pairwiseTestCount);

    // Step 6: Verify that theoretical maximum combinations increases with order
    const twoWayTheoretical = statsResponse2Way.body.statistics.theoreticalMax;
    const threeWayTheoretical =
      statsResponse3Way.body.statistics.theoreticalMax;

    expect(threeWayTheoretical).toBeGreaterThan(twoWayTheoretical);
  });

  test("Error handling in statistics workflow", async () => {
    // Test with invalid model format
    const invalidModelResponse = await request(app)
      .post("/api/stats")
      .send({
        model: "Not an array",
        options: { order: 2 },
      });

    expect(invalidModelResponse.status).toBe(400);
    expect(invalidModelResponse.body).toHaveProperty("error");

    // Test with invalid constraint
    const invalidConstraintResponse = await request(app)
      .post("/api/stats")
      .send({
        model: orderSystemModel,
        constraints: ["[nonexistent] = 'value'"],
        options: { order: 2 },
      });

    expect(invalidConstraintResponse.status).not.toBe(200);

    // Test with invalid order (too high)
    const invalidOrderResponse = await request(app)
      .post("/api/stats")
      .send({
        model: orderSystemModel,
        options: { order: 10 }, // Much higher than number of parameters
      });

    // The API should handle this gracefully
    expect(invalidOrderResponse.status).not.toBe(200);
  });
});
