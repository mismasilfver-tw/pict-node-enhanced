export interface EnhancedStatistics {
  order: number;
  generatedTests: number;
  theoreticalMax: number;
  coveragePercentage: number;
  efficiency: string;
  constraintReduction: number;
}

export interface PictResponse {
  testCases: any[];
  statistics: EnhancedStatistics;
}
