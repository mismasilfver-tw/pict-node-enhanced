# PICT-Node Web Interface

This is the web interface for the PICT-Node library, allowing you to generate and manage test cases through a user-friendly web application.

## Features

- Interactive model editor for defining test parameters and values
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
2. Set the combination order (2-way for pairs, 3-way for triplets, etc.)
3. Click "Generate Test Cases" to create test cases
4. View the generated test cases in the table
5. Export the test cases as CSV or JSON if needed

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
