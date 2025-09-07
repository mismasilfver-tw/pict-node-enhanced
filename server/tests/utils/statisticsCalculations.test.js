/**
 * Unit tests for statistics calculation utility functions
 */
const {
  calculateTheoreticalMax,
  calculateCoveragePercentage,
  calculateEfficiency,
  calculateConstraintReduction,
  createEnhancedStatistics,
} = require("../../utils/statisticsCalculations");

describe("Statistics Calculations Utility", () => {
  // Sample test models
  const simpleModel = [
    {
      key: "type",
      values: ["Primary", "Logical", "Single"],
    },
    {
      key: "size",
      values: ["10", "100", "500", "1000"],
    },
    {
      key: "fileSystem",
      values: ["FAT", "FAT32", "NTFS"],
    },
  ];

  const emptyModel = [];

  const singleParamModel = [
    {
      key: "type",
      values: ["Primary", "Logical", "Single"],
    },
  ];

  const largeModel = [
    {
      key: "param1",
      values: ["a", "b", "c", "d", "e"],
    },
    {
      key: "param2",
      values: ["1", "2", "3", "4"],
    },
    {
      key: "param3",
      values: ["x", "y", "z"],
    },
    {
      key: "param4",
      values: ["true", "false"],
    },
    {
      key: "param5",
      values: ["red", "green", "blue", "yellow"],
    },
  ];

  describe("calculateTheoreticalMax", () => {
    test("should calculate correct theoretical max for 2-way combinations", () => {
      // For simpleModel with 3 parameters:
      // Param 1: 3 values, Param 2: 4 values, Param 3: 3 values
      // For 2-way: C(3,2) = 3 parameter pairs
      // Pair 1-2: 3*4 = 12 combinations
      // Pair 1-3: 3*3 = 9 combinations
      // Pair 2-3: 4*3 = 12 combinations
      // Total: 12 + 9 + 12 = 33 combinations
      expect(calculateTheoreticalMax(simpleModel, 2)).toBe(33);
    });

    test("should calculate correct theoretical max for 3-way combinations", () => {
      // For largeModel with 5 parameters and 3-way combinations
      // C(5,3) = 10 parameter triplets
      // Average values per parameter = (5+4+3+2+4)/5 = 3.6
      // Approximate total: 10 * (3.6^3) ≈ 10 * 46.656 ≈ 467
      const result = calculateTheoreticalMax(largeModel, 3);
      expect(result).toBeGreaterThan(400);
      expect(result).toBeLessThan(500);
    });

    test("should return 0 for empty model", () => {
      expect(calculateTheoreticalMax(emptyModel, 2)).toBe(0);
    });

    test("should return 0 when order is greater than number of parameters", () => {
      expect(calculateTheoreticalMax(singleParamModel, 2)).toBe(0);
    });

    test("should handle default order parameter", () => {
      // Same as first test but without explicitly specifying order=2
      expect(calculateTheoreticalMax(simpleModel)).toBe(33);
    });
  });

  describe("calculateCoveragePercentage", () => {
    test("should always return 100% for valid inputs (PICT guarantees full coverage)", () => {
      expect(calculateCoveragePercentage(10, 100)).toBe(100);
      expect(calculateCoveragePercentage(50, 500)).toBe(100);
    });

    test("should return 0 for invalid inputs", () => {
      expect(calculateCoveragePercentage(10, 0)).toBe(0);
      expect(calculateCoveragePercentage(10, -5)).toBe(0);
    });
  });

  describe("calculateEfficiency", () => {
    test("should calculate efficiency ratio correctly", () => {
      // For theoretical max of 100 combinations, minimum tests needed is log2(100) ≈ 7
      // If we generate 10 tests, efficiency is 7/10 = 0.7
      expect(calculateEfficiency(10, 100)).toBeCloseTo(0.7, 1);
    });

    test("should return 0 for invalid inputs", () => {
      expect(calculateEfficiency(0, 100)).toBe(0);
      expect(calculateEfficiency(10, 0)).toBe(0);
      expect(calculateEfficiency(-5, 100)).toBe(0);
    });

    test("should cap efficiency at 1", () => {
      // If we somehow generate fewer tests than the theoretical minimum
      expect(calculateEfficiency(2, 100)).toBe(1);
    });
  });

  describe("calculateConstraintReduction", () => {
    test("should calculate constraint reduction percentage correctly", () => {
      // If theoretical max is 100 and actual combinations is 75
      // Reduction is (100-75)/100 * 100 = 25%
      expect(calculateConstraintReduction(100, 75)).toBe(25);
    });

    test("should return 0 for invalid theoretical max", () => {
      expect(calculateConstraintReduction(0, 75)).toBe(0);
      expect(calculateConstraintReduction(-10, 75)).toBe(0);
    });

    test("should return 100% when constraints eliminate all combinations", () => {
      expect(calculateConstraintReduction(100, 0)).toBe(100);
    });

    test("should cap reduction at 100%", () => {
      // If actual combinations is negative (shouldn't happen but testing edge case)
      expect(calculateConstraintReduction(100, -10)).toBe(100);
    });
  });

  describe("createEnhancedStatistics", () => {
    test("should create enhanced statistics object with all metrics", () => {
      const baseStats = {
        combinations: 33,
        generatedTests: 12,
        generationTime: 0.05,
        generationTimeNodeJs: 10,
      };

      const enhanced = createEnhancedStatistics(baseStats, simpleModel, {
        order: 2,
      });

      expect(enhanced).toHaveProperty("combinations", 33);
      expect(enhanced).toHaveProperty("generatedTests", 12);
      expect(enhanced).toHaveProperty("generationTime", 0.05);
      expect(enhanced).toHaveProperty("generationTimeNodeJs", 10);
      expect(enhanced).toHaveProperty("order", 2);
      expect(enhanced).toHaveProperty("theoreticalMax");
      expect(enhanced).toHaveProperty("coveragePercentage", 100);
      expect(enhanced).toHaveProperty("efficiency");
      expect(enhanced).toHaveProperty("constraintReduction");
    });

    test("should use default order if not specified", () => {
      const baseStats = {
        combinations: 33,
        generatedTests: 12,
        generationTime: 0.05,
        generationTimeNodeJs: 10,
      };

      const enhanced = createEnhancedStatistics(baseStats, simpleModel);

      expect(enhanced).toHaveProperty("order", 2);
    });

    test("should return baseStats if inputs are invalid", () => {
      const baseStats = {
        combinations: 33,
        generatedTests: 12,
        generationTime: 0.05,
        generationTimeNodeJs: 10,
      };

      expect(createEnhancedStatistics(baseStats, null)).toBe(baseStats);
      expect(createEnhancedStatistics(null, simpleModel)).toBeNull();
    });
  });
});
