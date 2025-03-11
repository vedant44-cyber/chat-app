#!/bin/bash

set -e # Exit on error

# Create the output directory if it doesn't exist
mkdir -p src/generated

echo "Generating protobuf files..."

# Generate JavaScript code and TypeScript definitions
protoc \
  -I=../proto \
  -I=./node_modules/.bin/include \
  --js_out=import_style=commonjs,binary:src/generated \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:src/generated \
  ../proto/*.proto

echo "Generated files in src/generated/"
ls -la src/generated/

# Fix imports in generated files
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find src/generated -type f -name "*.ts" -exec sed -i '' 's/\.\.\/\.\.\/proto\//\.\//' {} +
  find src/generated -type f -name "*.js" -exec sed -i '' 's/\.\.\/\.\.\/proto\//\.\//' {} +
else
  # Linux and others
  find src/generated -type f -name "*.ts" -exec sed -i 's/\.\.\/\.\.\/proto\//\.\//' {} +
  find src/generated -type f -name "*.js" -exec sed -i 's/\.\.\/\.\.\/proto\//\.\//' {} +
fi

echo "Proto generation completed successfully" 