#!/bin/bash

# PICT-Node Setup Script
echo "Setting up PICT-Node project..."

# Install main project dependencies
echo "Installing main project dependencies..."
npm install

# Build the library
echo "Building the PICT-Node library..."
npm run build

# Install web interface dependencies
echo "Installing web interface dependencies..."
cd web-interface
npm install --legacy-peer-deps
cd ..

echo "Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "npm run dev"
echo ""
echo "Or to start only the production server:"
echo "npm start"
echo ""
echo "The web interface will be available at http://localhost:3001"
