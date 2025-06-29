import path from "path";
import { native } from "../src/api/native";
import {
  EXCLUDE_TYPES,
  NOT_RECORD_TYPES,
  NOT_STRING_TYPES,
  getTestModelContent,
  expectAsyncToThrowError,
} from "./utils";

describe("native()", () => {
  describe("Common Validation", () => {
    test("Should throw an error if the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = async () => await native(notRecord);
        await expectAsyncToThrowError(
          act,
          "the first argument: must be a record",
        );
      }
    });

    test('Should throw an error if "options" is not undefined or a record', async () => {
      for (const notString of EXCLUDE_TYPES(["undefined", "record"])) {
        const act = async () =>
          await native({
            model: "_model_text_",
            // @ts-expect-error
            options: notString,
          });
        await expectAsyncToThrowError(act, '"options": must be a record');
      }
    });

    test('Should throw an error if "options.order" is not a positive number', async () => {
      const invalidTypes = [...EXCLUDE_TYPES(["undefined", "number"]), -1, 0];
      for (const notNumber of invalidTypes) {
        const act = async () =>
          await native({
            model: "_model_text_",
            options: {
              // @ts-expect-error
              order: notNumber,
            },
          });

        await expectAsyncToThrowError(
          act,
          '"options.order": must be a positive number',
        );
      }
    });

    test('Should throw an error if "random" has an invalid type', async () => {
      for (const invalidType of EXCLUDE_TYPES([
        "undefined",
        "number",
        "boolean",
      ])) {
        const act = async () =>
          await native({
            model: "_model_text_",
            options: {
              // @ts-expect-error
              random: invalidType,
            },
          });

        await expectAsyncToThrowError(
          act,
          '"options.random": must be a number or boolean',
        );
      }
    });

    test('Should throw an error if "caseSensitive" is not undefined or a boolean', async () => {
      for (const invalidType of EXCLUDE_TYPES(["undefined", "boolean"])) {
        const act = async () =>
          await native({
            model: "_model_text_",
            options: {
              // @ts-expect-error
              caseSensitive: invalidType,
            },
          });

        await expectAsyncToThrowError(
          act,
          '"options.caseSensitive": must be boolean',
        );
      }
    });
  });

  describe("Model Validation", () => {
    test('Should throw an error if "model" is not a string or record', async () => {
      for (const notString of EXCLUDE_TYPES(["string", "record"])) {
        const act = async () =>
          await native({
            // @ts-expect-error
            model: notString,
          });

        await expectAsyncToThrowError(act, '"model": must be a string');
      }
    });

    test('Should throw an error if "model.file" is not a string', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await native({
            model: {
              // @ts-expect-error
              file: notString,
            },
          });

        await expectAsyncToThrowError(
          act,
          '"model": must be a string or a type { file: string }',
        );
      }
    });
  });

  describe("Seed Validation", () => {
    test('Should throw an error if "seed" is not a string or record or undefined', async () => {
      for (const notString of EXCLUDE_TYPES([
        "string",
        "record",
        "undefined",
      ])) {
        const act = async () =>
          await native({
            model: "_model_text_",
            // @ts-expect-error
            seed: notString,
          });

        await expectAsyncToThrowError(act, '"seed": must be a string');
      }
    });

    test('Should throw an error if "seed.file" is not a string', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await native({
            model: "_model_text_",
            seed: {
              // @ts-expect-error
              file: notString,
            },
          });

        await expectAsyncToThrowError(
          act,
          '"seed": must be a string or a type { file: string }',
        );
      }
    });
  });

  describe("Separators", () => {
    describe("Separators Validation", () => {
      const separators = [
        "aliasSeparator",
        "valueSeparator",
        "negativePrefix",
      ] as const;

      for (const separator of separators) {
        test(`Should throw an error if "${separator}" is not a string containing a single character`, async () => {
          for (const invalidType of EXCLUDE_TYPES(["string", "undefined"])) {
            const format = typeof invalidType === "string" ? ",," : invalidType;

            const act = async () =>
              await native({
                model: "_model_text_",
                options: {
                  [separator]: format,
                },
              });

            await expectAsyncToThrowError(
              act,
              `"options.${separator}": must be a string containing a single character`,
            );
          }
        });
      }
    });
  });

  describe("Cases", () => {
    test("The simple model (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model");

      const result = await native({
        model: {
          file: modelPath,
        },
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeSameMembers([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });

    test("Should ignore statistics field", async () => {
      const modelPath = path.resolve(__dirname, "./models/model");

      const result = await native({
        model: {
          file: modelPath,
        },
        options: {
          // @ts-expect-error
          statistics: true,
        },
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeSameMembers([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });

    test("The simple model with alias operator and symbol key", async () => {
      const model = await getTestModelContent("model-alias");

      const result = await native({
        model,
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeAnyMembers([
        { A: "1", ["B"]: "3" },
        { A: "1", ["B"]: "4" },
        { A: "2", ["B"]: "4" },
        { A: "two", ["B"]: "3" },
      ]);
    });

    test("The simple model with negative operator and number key (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model-negative");

      const result = await native({
        model: {
          file: modelPath,
        },
      });

      expect(result).toHaveLength(15);

      expect(result).toIncludeAnyMembers([
        { A: "0", B: "2" },
        { A: "0", B: "1" },
        { A: "1", B: "2" },
        { A: "2", B: "1" },
        { A: "1", B: "0" },
        { A: "2", B: "0" },
        { A: "1", B: "1" },
        { A: "2", B: "2" },
        { A: "0", B: "0" },
        { A: "0", B: "-1" },
        { A: "1", B: "-1" },
        { A: "-1", B: "0" },
        { A: "-1", B: "1" },
        { A: "2", B: "-1" },
        { A: "-1", B: "2" },
      ]);
    });
    test("The simple model with weight operator", async () => {
      const model = await getTestModelContent("model-weight");

      const result = await native({
        model,
      });

      expect(result).toHaveLength(21);

      expect(result).toIncludeAnyMembers([
        { Type: "Primary", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Single", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "slow", FileSystem: "FAT" },
        { Type: "Stripe", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Mirror", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "quick", FileSystem: "FAT32" },
        { Type: "Span", FormatMethod: "slow", FileSystem: "FAT" },
        { Type: "Span", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Mirror", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Primary", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "RAID-5", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Single", FormatMethod: "quick", FileSystem: "FAT32" },
        { Type: "Single", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "RAID-5", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Span", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Mirror", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Primary", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Stripe", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "RAID-5", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Stripe", FormatMethod: "slow", FileSystem: "FAT" },
      ]);
    });

    test("The large model with all combinations (in the file)", async () => {
      const modelPath = path.resolve(
        __dirname,
        "./models/model-all-combinations",
      );

      const result = await native({
        model: {
          file: modelPath,
        },
        options: {
          order: 3,
        },
      });

      expect(result).toHaveLength(27);

      expect(result).toIncludeSameMembers([
        { Type: "Single", Size: "500", FormatMethod: "Quick" },
        { Type: "Span", Size: "500", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "500", FormatMethod: "Slow" },
        { Type: "Span", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "10", FormatMethod: "Slow" },
        { Type: "Span", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Span", Size: "100", FormatMethod: "Quick" },
        { Type: "Single", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "100", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "500", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "10", FormatMethod: "Quick" },
        { Type: "Stripe", Size: "100", FormatMethod: "Slow" },
        { Type: "Span", Size: "500", FormatMethod: "Quick" },
        { Type: "Span", Size: "10", FormatMethod: "Quick" },
        { Type: "Stripe", Size: "10", FormatMethod: "Slow" },
        { Type: "Single", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "100", FormatMethod: "Quick" },
        { Type: "Single", Size: "100", FormatMethod: "Quick" },
        { Type: "Span", Size: "100", FormatMethod: "Slow" },
        { Type: "Span", Size: "10", FormatMethod: "Slow" },
        { Type: "Single", Size: "10", FormatMethod: "Quick" },
        { Type: "Span", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "500", FormatMethod: "Quick" },
      ]);
    });

    test("The model with sub models", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
        {
          key: "C",
          values: ["5", "6", "7"],
        },
      ] as const;

      const model = await getTestModelContent("model-sub-models");

      const result = await native({
        model,
      });

      expect(result).toHaveLength(12);

      expect(result).toIncludeSameMembers([
        { A: "1", B: "4", C: "7" },
        { A: "2", B: "4", C: "6" },
        { A: "1", B: "4", C: "5" },
        { A: "2", B: "4", C: "5" },
        { A: "2", B: "4", C: "7" },
        { A: "1", B: "4", C: "6" },
        { A: "1", B: "3", C: "5" },
        { A: "2", B: "3", C: "6" },
        { A: "2", B: "3", C: "7" },
        { A: "1", B: "3", C: "7" },
        { A: "1", B: "3", C: "6" },
        { A: "2", B: "3", C: "5" },
      ]);
    });

    test("The model with seeding (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model-for-seed");
      const seedPath = path.resolve(__dirname, "./models/seed-for-model");

      const result = await native({
        model: {
          file: modelPath,
        },
        seed: {
          file: seedPath,
        },
      });

      expect(result).toHaveLength(9);

      expect(result).toIncludeSameMembers([
        { Platform: "arm", CPUS: "2" },
        { Platform: "arm", CPUS: "1" },
        { Platform: "x86", CPUS: "4" },
        { Platform: "arm", CPUS: "4" },
        { Platform: "x86", CPUS: "2" },
        { Platform: "x64", CPUS: "1" },
        { Platform: "x86", CPUS: "1" },
        { Platform: "x64", CPUS: "2" },
        { Platform: "x64", CPUS: "4" },
      ]);
    });

    test("The model with seeding", async () => {
      const model = await getTestModelContent("model-for-seed");
      const seed = await getTestModelContent("seed-for-model");

      const result = await native({
        model,
        seed,
      });

      expect(result).toHaveLength(9);

      expect(result).toIncludeSameMembers([
        { Platform: "arm", CPUS: "2" },
        { Platform: "arm", CPUS: "1" },
        { Platform: "x86", CPUS: "4" },
        { Platform: "arm", CPUS: "4" },
        { Platform: "x86", CPUS: "2" },
        { Platform: "x64", CPUS: "1" },
        { Platform: "x86", CPUS: "1" },
        { Platform: "x64", CPUS: "2" },
        { Platform: "x64", CPUS: "4" },
      ]);
    });
  });

  describe("Statistics", () => {
    test("Should return statistics", async () => {
      const modelPath = path.resolve(__dirname, "./models/model");

      const result = await native.stats({
        model: {
          file: modelPath,
        },
      });

      expect(result).toEqual({
        generationTimeNodeJs: expect.any(Number),
        combinations: 4,
        generatedTests: 4,
        generationTime: expect.any(String),
      });
    });
  });
});
