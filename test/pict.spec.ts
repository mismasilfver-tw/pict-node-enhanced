import {
  EXCLUDE_TYPES,
  NOT_ARRAY_TYPES,
  NOT_PROPERTY_KEY_TYPES,
  NOT_RECORD_TYPES,
  expectAsyncToThrowError,
} from "./utils";
import { pict } from "../src/api/pict";
import type { PictTypedModel } from "../src/api/pict/types";
import type { InputSubModel, PictModel } from "../src/common/types";
import { alias } from "../src/common/operators/alias";
import { negative } from "../src/common/operators/negative";
import { weight } from "../src/common/operators/weight";

describe("pict()", () => {
  describe("Common Validation", () => {
    test("Should throw an error is the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = async () => await pict(notRecord);
        await expectAsyncToThrowError(
          act,
          "the first argument: must be a record",
        );
      }
    });

    test("Should throw an error is the first argument is not a record or undefined", async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const notRecord of EXCLUDE_TYPES(["undefined", "record"])) {
        // @ts-expect-error
        const act = async () => await pict({ model }, notRecord);
        await expectAsyncToThrowError(
          act,
          "the second argument: must be a record",
        );
      }
    });

    test('Should throw an error if "order" is not undefined or a positive number', async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ];

      for (const invalidOrder of [-2, -1, -0.5, 0]) {
        const act = async () =>
          await pict(
            {
              model,
            },
            {
              order: invalidOrder,
            },
          );

        await expectAsyncToThrowError(
          act,
          '"order": must be a positive number',
        );
      }
    });

    test('Should throw an error if "order" is larger than number of parameters', async () => {
      const model = [
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
          values: ["5", "6"],
        },
      ] as const;

      const act = async () =>
        await pict(
          {
            model,
          },
          {
            order: 4,
          },
        );

      await expectAsyncToThrowError(
        act,
        '"order" cannot be larger than number of parameters',
      );
    });

    test('Should throw an error if "random" has an invalid type', async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES([
        "undefined",
        "number",
        "boolean",
      ])) {
        const act = async () =>
          await pict(
            {
              model,
            },
            {
              // @ts-expect-error
              random: invalidType,
            },
          );

        await expectAsyncToThrowError(
          act,
          "options.random: must be a number or boolean",
        );
      }
    });
  });

  describe("Models", () => {
    test("Should throw an error if model is not an array", async () => {
      for (const notArray of NOT_ARRAY_TYPES) {
        const act = async () =>
          await pict({
            // @ts-expect-error
            model: notArray,
          });
        await expectAsyncToThrowError(act, '"model": must be an array');
      }
    });

    test("Should throw an error if model is en empty array", async () => {
      const act = async () =>
        await pict({
          model: [],
        });

      await expectAsyncToThrowError(
        act,
        '"model" must contain at least 1 item',
      );
    });

    test("Should throw an error if model contain an invalid parameter", async () => {
      const invalidModels: Array<{ index: number; model: PictTypedModel[] }> = [
        // @ts-expect-error
        ...NOT_RECORD_TYPES.map((notRecord) => ({
          index: 1,
          model: [
            {
              key: "A",
              values: ["1", "2"],
            },
            notRecord,
          ],
        })),
        // @ts-expect-error
        ...NOT_ARRAY_TYPES.map((notArray) => ({
          index: 1,
          model: [
            {
              key: "A",
              values: ["1", "2"],
            },

            {
              key: "A",
              values: notArray,
            },
          ],
        })),
        // @ts-expect-error
        ...NOT_PROPERTY_KEY_TYPES.map((notPropertyKey) => ({
          index: 1,
          model: [
            {
              key: "A",
              values: ["1", "2"],
            },

            {
              key: notPropertyKey,
              values: ["A"],
            },
          ],
        })),
        {
          index: 1,
          model: [
            {
              key: "A",
              values: ["1", "2"],
            },
            // @ts-expect-error
            {},
          ],
        },
        {
          index: 0,
          model: [
            // @ts-expect-error
            {
              key: "B",
            },
            {
              key: "A",
              values: ["1", "2"],
            },
          ],
        },
        {
          index: 1,
          model: [
            {
              key: "A",
              values: ["1", "2"],
            },
            // @ts-expect-error
            {
              values: ["1", "2"],
            },
          ],
        },
      ];

      for (const invalidModel of invalidModels) {
        const act = async () =>
          await pict({
            model: invalidModel.model,
          });

        await expectAsyncToThrowError(
          act,
          `model[${invalidModel.index}]: must be a type { key: PropertyKey, values: unknown[] }`,
        );
      }
    });
  });

  describe("Sub Models", () => {
    test('Should throw an error if "sub" is not undefined and an array', async () => {
      for (const notRecord of EXCLUDE_TYPES(["undefined", "array"])) {
        const model = [
          {
            key: "A",
            values: ["1", "2"],
          },
        ] as const;

        const act = async () =>
          await pict({
            model,
            // @ts-expect-error
            sub: notRecord,
          });
        await expectAsyncToThrowError(act, '"sub": must be an array');
      }
    });

    test("Should throw an error if sub modules contains non-existent parameter", async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await pict({
          model,
          sub: [
            {
              // @ts-expect-error
              keys: ["A", "_NOT_EXISTENT_"],
              order: 2,
            },
          ],
        });

      await expectAsyncToThrowError(
        act,
        `Parameter "_NOT_EXISTENT_" has been not found`,
      );
    });

    test("Should throw an error if sub models contains an invalid type", async () => {
      const invalidSubModels: Array<{
        subModels: Array<InputSubModel<ReadonlyArray<PictModel>>>;
        index: number;
      }> = [
        // @ts-expect-error
        ...NOT_RECORD_TYPES.map((notRecord) => ({
          subModels: [notRecord],
          index: 0,
        })),
        // @ts-expect-error
        ...NOT_ARRAY_TYPES.map((notArray) => ({
          subModels: [
            {
              keys: notArray,
            },
          ],
          index: 0,
        })),
        // @ts-expect-error
        ...EXCLUDE_TYPES(["undefined", "number"]).map((notNumber) => ({
          subModels: [
            {
              keys: ["A", "B"],
              order: 2,
            },
            {
              keys: ["C", "D"],
              order: notNumber,
            },
          ],
          index: 1,
        })),
        {
          // @ts-expect-error
          subModels: [{}],
          index: 0,
        },
      ];

      for (const item of invalidSubModels) {
        const model = [
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
            values: ["5", "6"],
          },
          {
            key: "D",
            values: ["7", "8"],
          },
        ] as const;

        const act = async () =>
          await pict({
            model,
            sub: item.subModels,
          });

        await expectAsyncToThrowError(
          act,
          `sub[${item.index}]: must be an type { keys: Array<PropertyKey>; order?: number }`,
        );
      }
    });
  });

  describe("Seeding", () => {
    test('Should throw an error if "seed" is not an array', async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES(["array", "undefined"])) {
        const act = async () =>
          await pict({
            model,
            // @ts-expect-error
            seed: invalidType,
          });

        await expectAsyncToThrowError(
          act,
          `"seed": must be an array Array<{ [key: PropertyKey]: unknown }>`,
        );
      }
    });

    test('Should throw an error if "seed" contains a non-existent parameter', async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await pict({
          model,
          seed: [
            {
              // @ts-expect-error
              _NOT_EXISTENT_: "1",
            },
          ],
        });

      await expectAsyncToThrowError(
        act,
        `Parameter "_NOT_EXISTENT_" has been not found`,
      );
    });

    test("Should throw an error if seed parameter value is not in the model", async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await pict({
          model,
          seed: [
            {
              // @ts-expect-error
              A: "_NOT_EXISTENT_",
            },
          ],
        });

      await expectAsyncToThrowError(
        act,
        `Value "_NOT_EXISTENT_" has been not found`,
      );
    });
  });

  describe("Cases", () => {
    test("The simple model", async () => {
      const object = { number: 4 };
      const symbol = Symbol("symbol");

      const model = [
        {
          key: "A",
          values: [null, false],
        },
        {
          key: "B",
          values: [symbol, object],
        },
      ] as const;

      const result = await pict({
        model,
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeSameMembers([
        { A: null, B: object },
        { A: null, B: symbol },
        { A: false, B: object },
        { A: false, B: symbol },
      ]);
    });

    test("The simple model with alias operator and symbol key", async () => {
      const sybmolKey = Symbol("symbol");

      const model = [
        {
          key: "A",
          values: ["1", alias([2, "two"] as const)],
        },
        {
          key: sybmolKey,
          values: ["3", "4"],
        },
      ] as const;

      const result = await pict({
        model,
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeAnyMembers([
        { A: "1", [sybmolKey]: "3" },
        { A: "1", [sybmolKey]: "4" },
        { A: 2, [sybmolKey]: "4" },
        { A: "two", [sybmolKey]: "3" },
      ]);
    });

    test("The simple model with negative operator and number key", async () => {
      const model = [
        {
          key: 100,
          values: [negative(-1 as const), 0, 1, 2],
        },
        {
          key: "B",
          values: [negative(-1 as const), 0, 1, 2],
        },
      ] as const;

      const result = await pict({
        model,
      });

      expect(result).toHaveLength(15);

      expect(result).toIncludeAnyMembers([
        { 100: 0, B: 2 },
        { 100: 0, B: 1 },
        { 100: 1, B: 2 },
        { 100: 2, B: 1 },
        { 100: 1, B: 0 },
        { 100: 2, B: 0 },
        { 100: 1, B: 1 },
        { 100: 2, B: 2 },
        { 100: 0, B: 0 },
        { 100: 0, B: -1 },
        { 100: 1, B: -1 },
        { 100: -1, B: 0 },
        { 100: -1, B: 1 },
        { 100: 2, B: -1 },
        { 100: -1, B: 2 },
      ]);
    });

    test("The simple model with weight operator", async () => {
      const model = [
        {
          key: "Type",
          values: [
            weight("Primary" as const, 10),
            "Logical",
            "Single",
            "Span",
            "Stripe",
            "Mirror",
            "RAID-5",
          ],
        },
        {
          key: "FormatMethod",
          values: ["quick", "slow"],
        },
        {
          key: "FileSystem",
          values: ["FAT", "FAT32", weight("NTFS" as const, 10)],
        },
      ] as const;

      const result = await pict({
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

    test("The large model with all combinations", async () => {
      const model = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe"],
        },
        {
          key: "Size",
          values: [10, 100, 500],
        },
        {
          key: "FormatMethod",
          values: ["Quick", "Slow", "VerySlow"],
        },
      ];

      const result = await pict(
        {
          model,
        },
        {
          order: model.length,
        },
      );

      expect(result).toHaveLength(27);

      expect(result).toIncludeSameMembers([
        { Type: "Single", Size: 500, FormatMethod: "Quick" },
        { Type: "Span", Size: 500, FormatMethod: "Slow" },
        { Type: "Stripe", Size: 500, FormatMethod: "Slow" },
        { Type: "Span", Size: 10, FormatMethod: "VerySlow" },
        { Type: "Single", Size: 10, FormatMethod: "Slow" },
        { Type: "Span", Size: 100, FormatMethod: "VerySlow" },
        { Type: "Span", Size: 100, FormatMethod: "Quick" },
        { Type: "Single", Size: 500, FormatMethod: "VerySlow" },
        { Type: "Single", Size: 100, FormatMethod: "Slow" },
        { Type: "Stripe", Size: 10, FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: 500, FormatMethod: "VerySlow" },
        { Type: "Single", Size: 10, FormatMethod: "VerySlow" },
        { Type: "Single", Size: 500, FormatMethod: "Slow" },
        { Type: "Stripe", Size: 10, FormatMethod: "Quick" },
        { Type: "Stripe", Size: 100, FormatMethod: "Slow" },
        { Type: "Span", Size: 500, FormatMethod: "Quick" },
        { Type: "Span", Size: 10, FormatMethod: "Quick" },
        { Type: "Stripe", Size: 10, FormatMethod: "Slow" },
        { Type: "Single", Size: 100, FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: 100, FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: 100, FormatMethod: "Quick" },
        { Type: "Single", Size: 100, FormatMethod: "Quick" },
        { Type: "Span", Size: 100, FormatMethod: "Slow" },
        { Type: "Span", Size: 10, FormatMethod: "Slow" },
        { Type: "Single", Size: 10, FormatMethod: "Quick" },
        { Type: "Span", Size: 500, FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: 500, FormatMethod: "Quick" },
      ]);
    });

    test("The model with sub models", async () => {
      const model = [
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

      const result = await pict({
        model,
        sub: [
          {
            keys: ["B", "C"],
            order: 2,
          },
        ],
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

    test("The model with seeding", async () => {
      const model = [
        {
          key: "Platform",
          values: ["x86", "x64", "arm"],
        },
        {
          key: "CPUS",
          values: ["1", "2", "4"],
        },
      ] as const;

      const result = await pict({
        model,
        seed: [
          {
            Platform: "arm",
            CPUS: "2",
          },
        ],
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
      const model = [
        {
          key: "Platform",
          values: ["x86", "x64", "arm"],
        },
        {
          key: "CPUS",
          values: ["1", "2", "4"],
        },
      ] as const;

      const result = await pict.stats({ model });

      expect(result).toEqual({
        generationTimeNodeJs: expect.any(Number),
        combinations: 9,
        generatedTests: 9,
        generationTime: expect.any(String),
      });
    });
  });
});
