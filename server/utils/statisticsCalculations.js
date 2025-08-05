/**
 * Utility functions for enhanced PICT statistics calculations
 */

/**
 * Calculate the theoretical maximum number of combinations for a model
 * @param {Array} model - The PICT model with parameters and values
 * @param {Number} order - The order of combinations (2 for pairwise, 3 for 3-way, etc.)
 * @returns {Number} - The theoretical maximum number of combinations
 */
const calculateTheoreticalMax = (model, order = 2) => {
  if (!model || !Array.isArray(model) || model.length < order) {
    return 0;
  }

  // For n-way combinations, we need to calculate C(n,k) * product of values
  // where C(n,k) is the binomial coefficient (n choose k)
  // and product of values is the product of the number of values for each parameter
  
  // Calculate the number of parameter combinations (n choose k)
  const n = model.length;
  const k = order;
  
  // Calculate binomial coefficient (n choose k)
  const combinations = binomialCoefficient(n, k);
  
  // Calculate average number of values per parameter combination
  let totalCombinations = 0;
  
  // For each possible combination of k parameters
  // We need to use a more efficient approach than generating all combinations
  if (order === 2) {
    // Optimize for the common case of pairwise testing
    for (let i = 0; i < model.length - 1; i++) {
      for (let j = i + 1; j < model.length; j++) {
        totalCombinations += model[i].values.length * model[j].values.length;
      }
    }
  } else {
    // For higher orders, use a formula-based approach
    // This is an approximation that works well for uniform value distributions
    let avgValuesPerParam = 0;
    for (const param of model) {
      avgValuesPerParam += param.values.length;
    }
    avgValuesPerParam /= model.length;
    
    // Theoretical maximum is approximately C(n,k) * avgValuesPerParam^k
    totalCombinations = combinations * Math.pow(avgValuesPerParam, order);
  }
  
  return Math.round(totalCombinations);
};

/**
 * Calculate binomial coefficient (n choose k)
 * @param {Number} n - Total number of items
 * @param {Number} k - Number of items to choose
 * @returns {Number} - Binomial coefficient
 */
const binomialCoefficient = (n, k) => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use the symmetry of binomial coefficients
  if (k > n - k) k = n - k;
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - (k - i));
    result /= i;
  }
  
  return Math.round(result);
};

/**
 * Calculate coverage percentage based on generated tests and total possible combinations
 * @param {Number} generatedTests - Number of test cases generated
 * @param {Number} totalCombinations - Total possible combinations
 * @returns {Number} - Coverage percentage (0-100)
 */
const calculateCoveragePercentage = (generatedTests, totalCombinations) => {
  if (!totalCombinations || totalCombinations <= 0) return 0;
  
  // PICT guarantees 100% coverage of the specified order combinations
  // This is a fundamental property of the PICT algorithm
  return 100;
};

/**
 * Calculate efficiency ratio (how efficiently the algorithm covered combinations)
 * @param {Number} generatedTests - Number of test cases generated
 * @param {Number} theoreticalMax - Theoretical maximum number of combinations
 * @returns {Number} - Efficiency ratio (0-1)
 */
const calculateEfficiency = (generatedTests, theoreticalMax) => {
  if (!theoreticalMax || theoreticalMax <= 0 || !generatedTests || generatedTests <= 0) {
    return 0;
  }
  
  // Efficiency is the ratio of theoretical minimum tests needed to actual tests generated
  // Lower is better (closer to optimal solution)
  // We invert it so higher is better (0-1 scale)
  const minPossibleTests = Math.ceil(Math.log(theoreticalMax) / Math.log(2));
  const efficiency = minPossibleTests / generatedTests;
  
  // Cap at 1 and ensure it's not negative
  return Math.min(1, Math.max(0, efficiency));
};

/**
 * Calculate constraint reduction percentage (how much constraints reduced the test space)
 * @param {Number} theoreticalMax - Theoretical maximum without constraints
 * @param {Number} actualCombinations - Actual combinations with constraints
 * @returns {Number} - Constraint reduction percentage (0-100)
 */
const calculateConstraintReduction = (theoreticalMax, actualCombinations) => {
  if (!theoreticalMax || theoreticalMax <= 0) return 0;
  if (!actualCombinations || actualCombinations <= 0) return 100;
  
  const reduction = ((theoreticalMax - actualCombinations) / theoreticalMax) * 100;
  
  // Ensure it's between 0-100
  return Math.min(100, Math.max(0, reduction));
};

/**
 * Create enhanced statistics object with additional metrics
 * @param {Object} baseStats - Base PICT statistics
 * @param {Object} model - The PICT model
 * @param {Object} options - Options used for generation
 * @returns {Object} - Enhanced statistics object
 */
const createEnhancedStatistics = (baseStats, model, options = {}) => {
  if (!baseStats || !model) {
    return baseStats;
  }
  
  const order = options.order || 2;
  const theoreticalMax = calculateTheoreticalMax(model, order);
  const coveragePercentage = calculateCoveragePercentage(
    baseStats.generatedTests, 
    baseStats.combinations
  );
  const efficiency = calculateEfficiency(
    baseStats.generatedTests, 
    theoreticalMax
  );
  const constraintReduction = calculateConstraintReduction(
    theoreticalMax,
    baseStats.combinations
  );
  
  return {
    ...baseStats,
    order,
    theoreticalMax,
    coveragePercentage,
    efficiency,
    constraintReduction
  };
};

module.exports = {
  calculateTheoreticalMax,
  calculateCoveragePercentage,
  calculateEfficiency,
  calculateConstraintReduction,
  createEnhancedStatistics
};
