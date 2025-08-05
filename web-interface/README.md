# PICT-Node Web Interface

This is the web interface for the PICT-Node library, allowing you to generate and manage test cases through a user-friendly web application.

## Features

- Interactive model editor for defining test parameters and values
- Visual constraint builder with dropdown-based interface for creating constraints
- Toggle between text-based and visual constraint editing modes
- Real-time constraint validation and preview
- Real-time test case generation
- Example test models
- Export test cases as JSON or CSV
- Responsive design that works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 14 or later
- npm

### Installation

1. Install the dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open your browser and navigate to:

```
http://localhost:3000
```

## Usage

1. Define your test model by adding parameters and their possible values
2. Add constraints using either:
   - Text Editor mode: Manually type constraints using PICT syntax
   - Visual Builder mode: Use the dropdown interface to build constraints without typing syntax
3. Set the combination order (2-way for pairs, 3-way for triplets, etc.)
4. Click "Generate Test Cases" to create test cases
5. View the generated test cases in the table
6. Export the test cases as CSV or JSON if needed

### Using the Visual Constraint Builder

1. Click the "Visual Builder" toggle button in the Constraints section
2. Select constraint type (IF-THEN or Simple)
3. Build your constraint using the dropdown selectors for parameters, operators, and values
4. Review the constraint preview and validation feedback
5. Click "Add Constraint" to add it to your model
6. Continue adding multiple constraints without leaving the visual builder

## Examples

You can load example models from the "Load Example" dropdown to see how the tool works with different types of test models.

## API Integration

The web interface communicates with the PICT-Node API to generate test cases. The API endpoints are:

- `POST /api/generate` - Generate test cases based on a model
- `GET /api/examples` - Get example models

## Development

For development, you can run the web interface in development mode:

```bash
npm start
```

To build the production version:

```bash
npm run build
```
