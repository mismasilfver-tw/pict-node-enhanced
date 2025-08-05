import type { AliasOperatorObject } from "./operators/alias";
import type { NegativeOperatorObject } from "./operators/negative";
import type { WeightOperatorObject } from "./operators/weight";
import type { UnionToIntersection } from "type-fest";
import {
  createTypeGuard,
  TypeGuard,
  isRecord,
  isString,
  isUndefined,
  isNumber,
  isArray,
} from "tsguarder";
import { isPositiveNumber } from "./utils";

export interface PictCliOptions {
  order: number;
  random: RandomOption;
  aliasSeparator: string;
  valueSeparator: string;
  negativePrefix: string;
  caseSensitive: boolean;
  seeds: string;
  statistics: boolean;
}

export type PickPictCliOptions<T extends keyof PictCliOptions> = Pick<
  PictCliOptions,
  T
>;

export type PictModelId = string;

export interface PictModel<
  Key extends PropertyKey = PropertyKey,
  Values extends unknown = unknown,
> {
  key: Key;
  values: ReadonlyArray<Values>;
}

type ExtractParameterValue<ParameterValues> =
  ParameterValues extends ReadonlyArray<infer ParameterValuesItem>
    ? ParameterValuesItem extends AliasOperatorObject<
        infer ValueFromAliasOperator
      >
      ? ValueFromAliasOperator[number]
      : ParameterValuesItem extends NegativeOperatorObject<
            infer ValueFromNegativeOperator
          >
        ? ValueFromNegativeOperator
        : ParameterValuesItem extends WeightOperatorObject<
              infer ValueFromNegativeOperator
            >
          ? ValueFromNegativeOperator
          : ParameterValuesItem
    : never;

type PictModelToRecord<ModelArg> = ModelArg extends infer ModelArgInfer
  ? ModelArgInfer extends PictModel
    ? Record<
        ModelArgInfer["key"],
        ExtractParameterValue<ModelArgInfer["values"]>
      >
    : never
  : never;

export type InputSubModel<M extends ReadonlyArray<PictModel>> = {
  keys: ReadonlyArray<M[number]["key"]>;
  order?: number;
};

export const isInputSubModel: TypeGuard<
  InputSubModel<ReadonlyArray<PictModel>>
> = createTypeGuard(
  "must be an type { keys: Array<PropertyKey>; order?: number }",
  (value: unknown): value is InputSubModel<ReadonlyArray<PictModel>> => {
    if (!isRecord(value)) {
      return false;
    }

    if (!Array.isArray(value["keys"])) {
      return false;
    }

    if (!isUndefined(value["order"]) && !isPositiveNumber(value["order"])) {
      return false;
    }

    return true;
  },
);

export type InputSeed<
  M extends ReadonlyArray<PictModel>,
  T = Partial<InputPictModelToRecord<M>>,
> = ReadonlyArray<
  keyof T extends infer KeysInfer
    ? KeysInfer extends keyof T
      ? Partial<Record<KeysInfer, T[KeysInfer]>>
      : never
    : never
>;

export const isInputSeed: TypeGuard<InputSeed<ReadonlyArray<PictModel>>> =
  createTypeGuard(
    "must be an array Array<{ [key: PropertyKey]: unknown }>",
    (value: unknown): value is InputSeed<ReadonlyArray<PictModel>> =>
      isArray(value),
  );

export type InputPictModelToRecord<ModelArg> = UnionToIntersection<
  ModelArg extends infer ModelArgInfer
    ? ModelArgInfer extends ReadonlyArray<PictModel>
      ? ModelArgInfer[number] extends infer ModelItem
        ? ModelItem extends PictModel
          ? PictModelToRecord<ModelItem>
          : never
        : never
      : never
    : never
>;

export type RandomOption = number | string | boolean;

export const isRandomOption: TypeGuard<RandomOption> = createTypeGuard(
  "must be a number or boolean",
  (value: unknown): value is RandomOption => isNumber(value) || value === true,
);

export type ModelSeparator = string;

export const isModelSeparator: TypeGuard<ModelSeparator> = createTypeGuard(
  "must be a string containing a single character",
  (value: unknown): value is ModelSeparator => {
    return isString(value) && value.length === 1;
  },
);

export interface PictNodeStatistics {
  combinations: number;
  generatedTests: number;
  generationTime: number;
  generationTimeNodeJs: number;
}

/**
 * Enhanced PICT statistics interface with additional metrics
 * Extends the base PictNodeStatistics with calculated metrics for coverage analysis
 */
export interface EnhancedPictNodeStatistics extends PictNodeStatistics {
  /**
   * The order of combinations used for test generation (e.g., 2 for pairwise)
   */
  order: number;
  
  /**
   * The theoretical maximum number of combinations possible for the model
   * This represents the total combination space without constraints
   */
  theoreticalMax: number;
  
  /**
   * The percentage of combinations covered by the generated tests (0-100)
   * PICT guarantees 100% coverage of the specified order combinations
   */
  coveragePercentage: number;
  
  /**
   * Efficiency ratio of the test generation (0-1)
   * Higher values indicate more efficient test coverage with fewer test cases
   */
  efficiency: number;
  
  /**
   * Percentage reduction in combinations due to constraints (0-100)
   * Higher values indicate constraints significantly reduced the test space
   */
  constraintReduction: number;
}
