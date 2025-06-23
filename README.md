# [pict-node-enhanced](https://pict-node.js.org)

![CLI watch mode example](./docs/logo.svg)

### [Documentation](https://pict-node.js.org)

## Attribution

This project is based on [pict-node](https://github.com/microsoft/pict-node) and extends it with additional features including:

- Enhanced web interface with improved UI/UX
- Constraint handling improvements and validation
- Saved scenarios functionality with localStorage persistence
- Clear all values functionality
- Future plans for statistics visualization

The original project is licensed under the MIT License, and this enhanced version maintains that license.

This library is a wrapper around Microsoft's [PICT](https://github.com/microsoft/pict) (Pairwise Independent Combinatorial Testing) tool, designed to work with Node.js for generating combinations of inputs for software testing. PICT is a powerful tool that helps reduce the number of tests needed while still ensuring comprehensive coverage by generating optimized combinations of inputs.

The library boasts excellent **TypeScript** support! 🪄

> Before using this library, it's helpful to read Microsoft's official [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md) to learn about the tool and how it works.

## Features

- **Core Library** - TypeScript wrapper for PICT CLI tool
- **Web Interface** - React/TypeScript frontend for interactive test case generation
- **Express Server** - Backend API serving the web interface
- **Test Infrastructure** - Jest, ESLint, Prettier, Husky for quality control
- **Build Pipeline** - Rollup for library bundling

## Installation

```sh
npm install --save-dev pict-node
```

## Features

- **Core Library** - TypeScript wrapper for PICT CLI tool
- **Web Interface** - React/TypeScript frontend for interactive test case generation
- **Express Server** - Backend API serving the web interface
- **Test Infrastructure** - Jest, ESLint, Prettier, Husky for quality control
- **Build Pipeline** - Rollup for library bundling

## Overview

Imagine you have a function for creating order that accepts 6 parameters with several possible values for each argument.

| Parameter      | Possible Values                          |
| -------------- | ---------------------------------------- |
| Location       | Poland, Lithuania, Germany, USA          |
| Customer       | Individuals, Companies, Partners         |
| Time           | 05:00, 11:99, 15:00, 21:30, 23:59        |
| Payment System | VISA, MasterCard, PayPal, WebMoney, Qiwi |
| Product        | 1732, 319, 872, 650                      |
| Discount       | true, false                              |

This model has many possible combinations, which means we could have thousands of test cases to write and test. However, it's not practical to test all of them manually and in a reasonable amount of time. Instead, we can generate and test all possible pairs of values to achieve a good level of coverage.

```js
import { pict } from "pict-node";

const model = [
  {
    key: "location",
    values: ["Poland", "Lithuania", "Germany", "USA"],
  },
  {
    key: "customer",
    values: ["Individuals", "Companies", "Partners"],
  },
  {
    key: "time",
    values: ["05:00", "11:99", "15:00", "21:30", "23:59"],
  },
  {
    key: "paymentSystem",
    values: ["VISA", "MasterCard", "PayPal", "WebMoney", "Qiwi"],
  },
  {
    key: "product",
    values: [
      {
        id: 1732,
      },
      {
        id: 319,
      },
      {
        id: 872,
      },
      {
        id: 650,
      },
    ],
  },
  {
    key: "discount",
    values: [true, false],
  },
];

const cases = await pict({ model });
```

PICT will generate the following test cases:

```js
[
  // ... ... ...
  {
    location: "Lithuania",
    customer: "Individuals",
    time: "23:59",
    paymentSystem: "Qiwi",
    product: { id: 650 },
    discount: true,
  },
  {
    location: "USA",
    customer: "Partners",
    time: "05:00",
    paymentSystem: "VISA",
    product: { id: 319 },
    discount: false,
  },
  // ... ... ...
  {
    location: "Poland",
    customer: "Companies",
    time: "23:59",
    paymentSystem: "MasterCard",
    product: { id: 1732 },
    discount: true,
  },
  // ... ... ...
];
```

## Web Interface

PICT-Node now includes a web interface for interactive test case generation. This provides a user-friendly way to:

- Define test models through a visual editor
- Generate test cases with a single click
- View and export test cases in various formats
- Load example models to get started quickly

### Using the Web Interface

1. Start the web interface:

```sh
# Start both the server and web interface in development mode
npm run dev

# Or start only the server in production mode
npm start
```

2. Open your browser and navigate to `http://localhost:3001`

3. Use the interface to create your test model and generate test cases

For more details, see the [Web Interface README](./web-interface/README.md).

## Create Test Cases

In most cases, to create test cases, you can use the `pict` function. The main feature of this function is that you can use any data type for the values.

```js
import { pict } from "pict-node";
import { createOrder } from "./src";

// Define test model
const model = [
  {
    key: "country",
    values: ["USA", "Canada", "Germany"],
  },
  {
    key: "age",
    values: [10, 16, 18, 25, 70],
  },
  {
    key: "product",
    values: [{ id: 50 }, { id: 350 }],
  },
];

// Generate test cases
const cases = await pict({ model });

// Iterate test cases
for (const { country, age, product } of cases) {
  // Call a function with the current test case
  const result = createOrder({
    country,
    age,
    product,
  });

  // Verify that the function returns the expected result
  expect(result).toBe("The order has been created");
}
```

By default, `pict-node` generates a pair-wise test suite (all pairs covered), but the order can be set by option `order` to a value larger than two.

```js
const cases = await pict(
  {
    model,
  },
  {
    order: 3,
  }
);
```

## Web Interface

PICT-Node now includes a web interface for interactive test case generation. This provides a user-friendly way to:

- Define test models through a visual editor
- Generate test cases with a single click
- View and export test cases in various formats
- Load example models to get started quickly

### Using the Web Interface

1. Clone the repository and set up the project:

```sh
git clone https://github.com/yourusername/pict-node.git
cd pict-node
./setup.sh
```

2. Start the web interface:

```sh
# Start both the server and web interface in development mode
npm run dev

# Or start only the server in production mode
npm start
```

3. Access the web interface:

   - React interface: `http://localhost:3000` (when running with `npm run dev`)
   - Simplified HTML interface: `http://localhost:3001` (when running with `npm run server`)

4. Use the interface to create your test model and generate test cases

### Web Interface Options

#### React Interface (Default)

The React interface is the primary web interface, offering a modern and interactive user experience with full TypeScript support.

- **Access**: Available at `http://localhost:3000` when running with `npm run dev`
- **Features**: Full-featured interface with React components, state management, and responsive design
- **Requirements**: Requires both the Express server and React development server to be running

#### Simplified HTML Interface

A lightweight alternative that works directly with the Express server without requiring the React development server.

- **Access**: Available at `http://localhost:3001` when running with `npm run server`
- **Features**: Basic functionality with vanilla JavaScript, no build step required
- **Requirements**: Only requires the Express server to be running

### Web Interface Features

- **Interactive Model Editor**: Add parameters and values with a user-friendly interface
- **Real-time Test Case Generation**: Generate test cases with a single click
- **Example Models**: Load pre-defined examples to get started quickly
- **Export Options**: Export test cases as JSON or CSV
- **Responsive Design**: Works on desktop and mobile devices

## API Reference

### Core Library

#### `pict(options, config?)`

Generates test cases based on the provided model.

```js
import { pict } from "pict-node";

const cases = await pict({
  model: [
    {
      key: "parameter1",
      values: ["value1", "value2"],
    },
    {
      key: "parameter2",
      values: [1, 2, 3],
    },
  ],
});
```

#### `strings(options, config?)`

Similar to `pict`, but only accepts string values and provides additional options for constraints.

```js
import { strings } from "pict-node";

const cases = await strings({
  model: [
    {
      key: "type",
      values: ["Primary", "Logical", "Single"],
    },
    {
      key: "size",
      values: ["10", "100", "500", "1000"],
    },
  ],
  constraints: ['IF [type] = "Primary" THEN [size] <= 500;'],
});
```

### Web Interface API

The web interface provides a REST API for generating test cases:

#### `POST /api/generate`

Generates test cases based on the provided model.

Request body:

```json
{
  "model": [
    {
      "key": "parameter1",
      "values": ["value1", "value2"]
    },
    {
      "key": "parameter2",
      "values": [1, 2, 3]
    }
  ],
  "options": {
    "order": 2
  }
}
```

Response:

```json
{
  "success": true,
  "cases": [
    {
      "parameter1": "value1",
      "parameter2": 1
    },
    {
      "parameter1": "value1",
      "parameter2": 2
    },
    {
      "parameter1": "value2",
      "parameter2": 3
    }
  ],
  "count": 3
}
```

#### `GET /api/examples`

Returns example models for demonstration.

Response:

```json
{
  "examples": [
    {
      "name": "Simple Order System",
      "model": [
        {
          "key": "location",
          "values": ["Poland", "Lithuania", "Germany", "USA"]
        },
        {
          "key": "customer",
          "values": ["Individuals", "Companies", "Partners"]
        }
      ]
    }
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Start the development server
npm run dev

# Start the production server
npm start
```

## Future Development Roadmap

### Constraints Editor Improvements

The following are potential improvements to the constraints editor UI to make it more user-friendly:

1. **Parameter Autocomplete/Dropdown**

   - Add autocomplete functionality that shows available parameters when typing `[`
   - Display a dropdown of available parameters that can be inserted with a click
   - Highlight parameter references in a different color for better visibility

2. **Visual Constraint Builder**

   - Create a visual builder with dropdowns for parameters, operators, values, and logical connectors
   - Allow users to build constraints using this interface, which generates the proper syntax

3. **Syntax Validation and Error Highlighting**

   - Add real-time syntax validation as users type
   - Highlight errors with red underlines and tooltips explaining the issue
   - Provide suggestions to fix common errors (like adding/removing quotes for numeric values)

4. **Type-Aware Value Formatting**

   - Automatically format values based on parameter type (string, numeric, boolean)
   - For numeric parameters, automatically remove quotes
   - For string parameters, automatically add quotes if missing

5. **Template Library**

   - Provide a library of common constraint templates (IF-THEN, AND/OR combinations, etc.)
   - Allow users to select a template and fill in the parameters and values

6. **Constraint Groups and Organization**

   - Allow grouping related constraints
   - Add collapsible sections for different constraint groups
   - Provide a way to enable/disable constraints without removing them

7. **Visual Feedback on Constraint Impact**

   - Show a preview of how many test cases would be affected by each constraint
   - Provide visual indicators of constraint "strength" (how much it reduces the test space)
   - Allow users to see which test cases would be eliminated by each constraint

8. **Improved Constraint List**

   - Color-code constraints by type (IF-THEN, simple equality, etc.)
   - Add icons representing the constraint type
   - Allow inline editing of existing constraints
   - Add a search/filter function for constraints

9. **Constraint Wizard for Beginners**

   - Add a "Constraint Wizard" that walks users through creating constraints step by step
   - Provide examples specific to the current model parameters
   - Include tooltips and help text throughout the interface

10. **Keyboard Shortcuts and Accessibility**
    - Add keyboard shortcuts for common operations
    - Ensure the interface is fully accessible with screen readers
    - Add tab navigation between constraint components

### Additional Web Interface Features

The following features from the core library are not yet implemented in the web interface:

1. **Sub-models Support**

   - Implement UI for defining relationships between parameters
   - Visual representation of sub-model hierarchies
   - Validation to ensure sub-models reference valid parameters

2. **Seed Values**

   - Add interface for providing seed values to influence test case generation
   - Preview how seed values affect the generated test cases
   - Option to randomly generate seed values

3. **Advanced Operators**

   - UI for applying operators to parameter values:
     - **Alias**: For creating aliases for values
     - **Negative**: For negative testing scenarios
     - **Weight**: For controlling the frequency of values in test cases
   - Visual indicators for values with operators applied

4. **Statistics Display**

   - Show detailed statistics about test case generation
   - Visualizations like coverage graphs or charts
   - Metrics on test space reduction and coverage efficiency

5. **Advanced Configuration Options**

   - Collapsible panel for advanced options:
     - **Random**: Toggle for randomizing test case generation
     - **Separators**: Custom syntax for alias, value, and negative prefix
     - **Case Sensitivity**: Toggle for case-sensitive matching
   - Presets for common configuration combinations

6. **Native API Access**

   - Advanced mode for direct access to PICT functionality
   - Custom command builder for power users
   - Option to view and edit the raw PICT model

7. **Documentation and Help**
   - Inline help text explaining advanced features
   - Interactive tutorials for new users
   - Examples showing how to use all features effectively
