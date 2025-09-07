/**
 * Integration tests for API routes
 */
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("../../routes");

// Create a test app
const app = express();
app.use(bodyParser.json());
app.use("/api", routes);

// Mock the pict and strings functions
jest.mock("../../../lib/index", () => {
  const mockTestCases = [
    { param1: "value1", param2: "value1" },
    { param1: "value1", param2: "value2" },
    { param1: "value2", param2: "value1" },
    { param1: "value2", param2: "value2" },
  ];

  const mockStats = {
    combinations: 4,
    generatedTests: 4,
    generationTime: 0.01,
    generationTimeNodeJs: 5,
  };

  return {
    pict: jest.fn().mockResolvedValue(mockTestCases),
    strings: jest.fn().mockResolvedValue(mockTestCases),
    pict: {
      stats: jest.fn().mockResolvedValue(mockStats),
    },
    strings: {
      stats: jest.fn().mockResolvedValue(mockStats),
    },
  };
});

describe("API Routes Integration Tests", () => {
  const testModel = [
    {
      key: "param1",
      values: ["value1", "value2"],
    },
    {
      key: "param2",
      values: ["value1", "value2"],
    },
  ];

  describe("POST /api/generate", () => {
    test("should return 200 and test cases with statistics", async () => {
      const response = await request(app)
        .post("/api/generate")
        .send({
          model: testModel,
          options: { order: 2 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("cases");
      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("statistics");
      expect(response.body.statistics).toHaveProperty("combinations");
      expect(response.body.statistics).toHaveProperty("generatedTests");
      expect(response.body.statistics).toHaveProperty("order", 2);
      expect(response.body.statistics).toHaveProperty("theoreticalMax");
      expect(response.body.statistics).toHaveProperty("coveragePercentage");
      expect(response.body.statistics).toHaveProperty("efficiency");
      expect(response.body.statistics).toHaveProperty("constraintReduction");
    });

    test("should handle constraints correctly", async () => {
      const response = await request(app)
        .post("/api/generate")
        .send({
          model: testModel,
          constraints: ['[param1] = "value1" => [param2] = "value1"'],
          options: { order: 2 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("cases");
      expect(response.body).toHaveProperty("statistics");
    });

    test("should return 400 for invalid model format", async () => {
      const response = await request(app)
        .post("/api/generate")
        .send({
          model: "invalid model",
          options: { order: 2 },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 for missing model", async () => {
      const response = await request(app)
        .post("/api/generate")
        .send({
          options: { order: 2 },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should handle different order values", async () => {
      const response = await request(app)
        .post("/api/generate")
        .send({
          model: testModel,
          options: { order: 3 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("statistics");
      expect(response.body.statistics).toHaveProperty("order", 3);
    });
  });

  describe("POST /api/stats", () => {
    test("should return 200 and statistics only", async () => {
      const response = await request(app)
        .post("/api/stats")
        .send({
          model: testModel,
          options: { order: 2 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("statistics");
      expect(response.body).not.toHaveProperty("cases");
      expect(response.body.statistics).toHaveProperty("combinations");
      expect(response.body.statistics).toHaveProperty("generatedTests");
      expect(response.body.statistics).toHaveProperty("order", 2);
      expect(response.body.statistics).toHaveProperty("theoreticalMax");
      expect(response.body.statistics).toHaveProperty("coveragePercentage");
      expect(response.body.statistics).toHaveProperty("efficiency");
      expect(response.body.statistics).toHaveProperty("constraintReduction");
    });

    test("should handle constraints correctly for stats endpoint", async () => {
      const response = await request(app)
        .post("/api/stats")
        .send({
          model: testModel,
          constraints: ['[param1] = "value1" => [param2] = "value1"'],
          options: { order: 2 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("statistics");
    });

    test("should return 400 for invalid model format", async () => {
      const response = await request(app)
        .post("/api/stats")
        .send({
          model: "invalid model",
          options: { order: 2 },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 for missing model", async () => {
      const response = await request(app)
        .post("/api/stats")
        .send({
          options: { order: 2 },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should handle different order values for stats endpoint", async () => {
      const response = await request(app)
        .post("/api/stats")
        .send({
          model: testModel,
          options: { order: 4 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("statistics");
      expect(response.body.statistics).toHaveProperty("order", 4);
    });
  });

  describe("GET /api/examples", () => {
    test("should return 200 and examples", async () => {
      const response = await request(app).get("/api/examples");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("examples");
      expect(Array.isArray(response.body.examples)).toBe(true);
      expect(response.body.examples.length).toBeGreaterThan(0);

      // Check structure of examples
      const firstExample = response.body.examples[0];
      expect(firstExample).toHaveProperty("name");
      expect(firstExample).toHaveProperty("model");
      expect(Array.isArray(firstExample.model)).toBe(true);
    });
  });

  describe("Error handling", () => {
    test("should handle non-existent routes", async () => {
      const response = await request(app).get("/api/nonexistent");

      expect(response.status).toBe(404);
    });

    test("should handle server errors in generate endpoint", async () => {
      // Mock pict to throw an error
      require("../../../lib/index").pict.mockRejectedValueOnce(
        new Error("PICT API error"),
      );

      const response = await request(app)
        .post("/api/generate")
        .send({
          model: testModel,
          options: { order: 2 },
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    test("should handle server errors in stats endpoint", async () => {
      // Mock pict.stats to throw an error
      require("../../../lib/index").pict.stats.mockRejectedValueOnce(
        new Error("Statistics error"),
      );

      const response = await request(app)
        .post("/api/stats")
        .send({
          model: testModel,
          options: { order: 2 },
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});
