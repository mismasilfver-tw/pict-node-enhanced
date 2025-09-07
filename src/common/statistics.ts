import { EOL } from "os";
import type { PictNodeStatistics, EnhancedPictNodeStatistics } from "./types";
import { enhanceStatistics } from "./enhancedStatistics";

/**
 * Parsing and formatting native PICT statistics to JS object
 */

/**
 * Normalizes raw string value and formats keys
 */
function normalizeParameter(key: string, value: string) {
  switch (key) {
    case "Combinations":
      return {
        combinations: Number.parseInt(value),
      } as const;

    case "Generated tests":
      return {
        generatedTests: Number.parseInt(value),
      } as const;

    case "Generation time":
      return {
        generationTime: value,
      } as const;

    default:
      throw new Error("Unexpected statistic key");
  }
}

/**
 * Parses a statistic parameter
 */
function parseParameter(raw: string) {
  const dividerIndex = raw.indexOf(":");

  if (dividerIndex === -1) {
    throw new Error("Unexpected statistic value");
  }

  const key = raw.substring(0, dividerIndex);
  const value = raw.substring(dividerIndex + 1).trim();

  return normalizeParameter(key, value);
}

/**
 * Receives raw PICT's statistics output and return normalized statistics
 */
export function parseStatistics(
  raw: string,
  generationTimeNodeJs: number,
): PictNodeStatistics {
  return raw
    .split(EOL)
    .filter(Boolean)
    .map(parseParameter)
    .reduce<Partial<PictNodeStatistics>>(
      (stats, item) => {
        return { ...stats, ...item } as PictNodeStatistics;
      },
      { generationTimeNodeJs },
    ) as PictNodeStatistics;
}

/**
 * Enhances the basic statistics with additional calculated metrics
 * @param baseStats The base statistics from PICT
 * @param order The order value used for test generation
 * @param parameterCount The number of parameters in the model
 * @returns Enhanced statistics with additional metrics
 */
export function parseEnhancedStatistics(
  raw: string,
  generationTimeNodeJs: number,
  order: number,
  parameterCount: number,
): EnhancedPictNodeStatistics {
  // First parse the base statistics
  const baseStats = parseStatistics(raw, generationTimeNodeJs);

  // Then enhance them with additional metrics
  return enhanceStatistics(baseStats, order, parameterCount);
}
