#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Install web interface dependencies
echo "Installing web interface dependencies..."
cd web-interface && npm install && cd ..

# Build the library if needed
if [ ! -d "lib" ]; then
  echo "Building the library..."
  npm run build
fi

# Start the development servers
echo "Starting the development servers..."
echo "Open http://localhost:3001 in your browser"
npm run dev
