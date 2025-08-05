import { 
  calculateTheoreticalMax, 
  calculateConstraintReduction, 
  enhanceStatistics 
} from "../src/common/enhancedStatistics";
import { PictNodeStatistics } from "../src/common/types";

/**
 * Unit tests for enhanced statistics utility functions
 * These tests validate the calculation logic for enhanced statistics metrics
 */
describe("Enhanced Statistics Utility Functions", () => {
  describe("calculateTheoreticalMax", () => {
    test("should calculate theoretical maximum for 2-way combinations correctly", () => {
      // For 4 parameters with order 2, theoretical max is C(4,2) = 6
      expect(calculateTheoreticalMax(4, 2)).toBe(6);
      
      // For 5 parameters with order 2, theoretical max is C(5,2) = 10
      expect(calculateTheoreticalMax(5, 2)).toBe(10);
      
      // For 10 parameters with order 2, theoretical max is C(10,2) = 45
      expect(calculateTheoreticalMax(10, 2)).toBe(45);
    });

    test("should calculate theoretical maximum for 3-way combinations correctly", () => {
      // For 5 parameters with order 3, theoretical max is C(5,3) = 10
      expect(calculateTheoreticalMax(5, 3)).toBe(10);
      
      // For 10 parameters with order 3, theoretical max is C(10,3) = 120
      expect(calculateTheoreticalMax(10, 3)).toBe(120);
    });

    test("should calculate theoretical maximum for 4-way combinations correctly", () => {
      // For 6 parameters with order 4, theoretical max is C(6,4) = 15
      expect(calculateTheoreticalMax(6, 4)).toBe(15);
      
      // For 10 parameters with order 4, theoretical max is C(10,4) = 210
      expect(calculateTheoreticalMax(10, 4)).toBe(210);
    });

    test("should handle edge cases correctly", () => {
      // When parameter count equals order, there's only one combination
      expect(calculateTheoreticalMax(3, 3)).toBe(1);
      
      // When parameter count is less than order, should return 0
      expect(calculateTheoreticalMax(2, 3)).toBe(0);
      
      // When order is 1, theoretical max equals parameter count
      expect(calculateTheoreticalMax(5, 1)).toBe(5);
    });
  });

  describe("calculateConstraintReduction", () => {
    test("should calculate constraint reduction percentage correctly", () => {
      // No reduction
      expect(calculateConstraintReduction(100, 100)).toBe(0);
      
      // 50% reduction
      expect(calculateConstraintReduction(100, 50)).toBe(50);
      
      // 75% reduction
      expect(calculateConstraintReduction(400, 100)).toBe(75);
      
      // 100% reduction (theoretical)
      expect(calculateConstraintReduction(100, 0)).toBe(100);
    });

    test("should handle edge cases correctly", () => {
      // When theoretical max is 0, should return 0
      expect(calculateConstraintReduction(0, 0)).toBe(0);
      
      // When actual combinations exceed theoretical max (shouldn't happen in practice)
      expect(calculateConstraintReduction(50, 100)).toBe(0);
    });
  });

  describe("enhanceStatistics", () => {
    test("should enhance base statistics with additional metrics", () => {
      // Create a base statistics object
      const baseStats: PictNodeStatistics = {
        combinations: 50,
        generatedTests: 10,
        generationTime: 0.5,
        generationTimeNodeJs: 0.1
      };

      // Parameters: 5, Order: 2
      const enhancedStats = enhanceStatistics(baseStats, 2, 5);

      // Verify enhanced fields
      expect(enhancedStats).toHaveProperty("order", 2);
      expect(enhancedStats).toHaveProperty("theoreticalMax", 10);
      expect(enhancedStats).toHaveProperty("coveragePercentage", 20); // 10/50 * 100 = 20%
      expect(enhancedStats).toHaveProperty("efficiency", 1); // 10/10 = 1
      expect(enhancedStats).toHaveProperty("constraintReduction", 0); // No reduction from theoretical
    });

    test("should handle constraint reduction scenarios", () => {
      // Create a base statistics object with constraints (fewer combinations than theoretical)
      const baseStats: PictNodeStatistics = {
        combinations: 6,
        generatedTests: 6,
        generationTime: 0.5,
        generationTimeNodeJs: 0.1
      };

      // Parameters: 5, Order: 2 (theoretical max = 10)
      const enhancedStats = enhanceStatistics(baseStats, 2, 5);

      // Verify constraint reduction
      expect(enhancedStats.theoreticalMax).toBe(10);
      expect(enhancedStats.constraintReduction).toBe(40); // (10-6)/10 * 100 = 40%
    });

    test("should handle 100% coverage scenario", () => {
      // Create a base statistics object with full coverage
      const baseStats: PictNodeStatistics = {
        combinations: 10,
        generatedTests: 10,
        generationTime: 0.5,
        generationTimeNodeJs: 0.1
      };

      // Parameters: 5, Order: 2
      const enhancedStats = enhanceStatistics(baseStats, 2, 5);

      // Verify coverage percentage
      expect(enhancedStats.coveragePercentage).toBe(100);
      expect(enhancedStats.efficiency).toBe(1);
    });

    test("should handle edge cases", () => {
      // Zero combinations
      const zeroStats: PictNodeStatistics = {
        combinations: 0,
        generatedTests: 0,
        generationTime: 0,
        generationTimeNodeJs: 0
      };

      const enhancedZeroStats = enhanceStatistics(zeroStats, 2, 5);
      expect(enhancedZeroStats.coveragePercentage).toBe(0);
      expect(enhancedZeroStats.efficiency).toBe(0);
      
      // More tests than combinations (shouldn't happen in practice)
      const unusualStats: PictNodeStatistics = {
        combinations: 5,
        generatedTests: 10,
        generationTime: 0.5,
        generationTimeNodeJs: 0.1
      };

      const enhancedUnusualStats = enhanceStatistics(unusualStats, 2, 3);
      expect(enhancedUnusualStats.coveragePercentage).toBe(100); // Capped at 100%
    });
  });
});
