# PICT-Node Statistics Implementation Guide

## Overview

This document outlines approaches for implementing statistics and coverage visualization features in the PICT-Node web interface.

## Available Infrastructure

The PICT-Node library already provides:

1. **Built-in Statistics API**: `pict.stats()` function that returns:

   ```typescript
   interface PictNodeStatistics {
     combinations: number; // Total possible combinations
     generatedTests: number; // Number of test cases generated
     generationTime: number; // PICT tool generation time
     generationTimeNodeJs: number; // Node.js processing time
   }
   ```

2. **Statistics Parsing**: The `parseStatistics()` function in `common/statistics.ts` handles raw PICT output parsing.

## Coverage Approaches

### 1. Basic Coverage Metrics

- **Coverage Ratio**: `generatedTests / combinations * 100`
- **Efficiency Score**: How much the test space was reduced
- **Generation Performance**: Time-based metrics

### 2. Pairwise/N-wise Coverage Visualization

- **Coverage Matrix**: Visual grid showing which parameter combinations are covered
- **Parameter Interaction Coverage**: Show which parameter pairs/tuples are tested
- **Missing Coverage Gaps**: Highlight untested combinations (if any)

### 3. Advanced Coverage Analysis

- **Parameter Value Distribution**: How evenly distributed are the values across test cases
- **Constraint Impact Analysis**: Show how constraints reduced the test space
- **Redundancy Analysis**: Identify potentially redundant test cases

## Implementation Plan

### Phase 1: Server-Side Integration

1. **Update Controller**: Modify `pictController.js` to call both `pict()` and `pict.stats()`
2. **Enhanced Response**: Include statistics in the API response alongside test cases

### Phase 2: Client-Side Statistics Component

1. **Statistics Display Component**: Create a React component to show basic metrics
2. **Add Visualization Library**: Integrate Chart.js or Recharts for graphs
3. **Coverage Dashboard**: Create visual representations of coverage data

### Phase 3: Advanced Analytics

1. **Coverage Matrix**: Build interactive heatmaps showing parameter coverage
2. **Constraint Analysis**: Visualize how constraints affect test generation
3. **Performance Trends**: Track statistics over time for saved scenarios

## Code Examples

### 1. Theoretical Maximum Coverage

```javascript
// Calculate total possible combinations without constraints
const calculateMaxCombinations = (model) => {
  return model.reduce((total, param) => total * param.values.length, 1);
};
```

### 2. Constraint-Adjusted Coverage

```javascript
// Coverage considering constraint limitations
const calculateConstraintAdjustedCoverage = (stats, constraints) => {
  // This would require analyzing how constraints reduce the valid test space
  return (stats.generatedTests / stats.combinations) * 100;
};
```

### 3. Parameter Pair Coverage

```javascript
// N-wise coverage analysis
const calculatePairwiseCoverage = (testCases, model) => {
  // Analyze how many unique parameter pairs are covered
  // vs total possible pairs
};
```

## UI/UX Design Recommendations

1. **Statistics Card**: Display key metrics prominently
2. **Coverage Donut Chart**: Visual representation of coverage percentage
3. **Performance Timeline**: Show generation times
4. **Interactive Coverage Matrix**: Click to explore specific combinations
5. **Export Options**: Allow users to export statistics as JSON/CSV

## Technical Stack Additions

1. **Visualization**: Chart.js or Recharts for React
2. **Data Processing**: Lodash for complex statistics calculations
3. **Export**: FileSaver.js for data export functionality

## References

- [PICT Documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Recharts Documentation](https://recharts.org/en-US/)
