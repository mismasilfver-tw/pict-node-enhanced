import { PictNodeStatistics, EnhancedPictNodeStatistics } from "./types";

/**
 * Calculates the theoretical maximum number of combinations based on the model parameters
 * @param parameterCount Number of parameters in the model
 * @param order The order value used (n-way combinations)
 * @returns The theoretical maximum number of combinations
 */
export function calculateTheoreticalMax(
  parameterCount: number,
  order: number,
): number {
  // For a model with n parameters and order k, the theoretical maximum
  // is the binomial coefficient C(n,k) = n! / (k! * (n-k)!)
  if (parameterCount < order) {
    return 0;
  }

  // Calculate binomial coefficient
  let result = 1;
  for (let i = 1; i <= order; i++) {
    result = (result * (parameterCount - (i - 1))) / i;
  }

  return Math.round(result);
}

/**
 * Calculates the constraint reduction percentage
 * @param theoreticalMax The theoretical maximum number of combinations
 * @param actualCombinations The actual number of combinations after constraints
 * @returns The percentage of combinations reduced by constraints (0-100)
 */
export function calculateConstraintReduction(
  theoreticalMax: number,
  actualCombinations: number,
): number {
  if (theoreticalMax <= 0) {
    return 0;
  }

  const reduction =
    ((theoreticalMax - actualCombinations) / theoreticalMax) * 100;
  return Math.max(0, Math.min(100, Math.round(reduction)));
}

/**
 * Enhances the basic PICT statistics with additional calculated metrics
 * @param baseStats The base statistics from PICT
 * @param order The order value used for test generation
 * @param parameterCount The number of parameters in the model
 * @returns Enhanced statistics with additional metrics
 */
export function enhanceStatistics(
  baseStats: PictNodeStatistics,
  order: number,
  parameterCount: number,
): EnhancedPictNodeStatistics {
  // Calculate theoretical maximum combinations
  const theoreticalMax = calculateTheoreticalMax(parameterCount, order);

  // Calculate coverage percentage
  const coveragePercentage =
    baseStats.combinations > 0
      ? Math.min(
          100,
          Math.round((baseStats.generatedTests / baseStats.combinations) * 100),
        )
      : 0;

  // Calculate efficiency (tests per combination)
  const efficiency =
    baseStats.combinations > 0
      ? parseFloat((baseStats.generatedTests / theoreticalMax).toFixed(2))
      : 0;

  // Calculate constraint reduction
  const constraintReduction = calculateConstraintReduction(
    theoreticalMax,
    baseStats.combinations,
  );

  // Return enhanced statistics
  return {
    ...baseStats,
    order,
    theoreticalMax,
    coveragePercentage,
    efficiency,
    constraintReduction,
  };
}
