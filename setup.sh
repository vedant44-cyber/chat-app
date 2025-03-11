#!/bin/bash

set -e # Exit on error

echo "🚀 Starting chat application setup..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check for Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check for Docker
if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for Go
if ! command_exists go; then
    echo "❌ Go is not installed. Please install Go first."
    exit 1
fi

echo "✅ All prerequisites are met"

# Clean up any previous installations
echo "🧹 Cleaning up previous installations..."
rm -rf frontend/node_modules frontend/dist backend/bin backend/proto
docker-compose down 2>/dev/null || true

# Install frontend dependencies and generate proto files
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
npm run install-protoc
npm run generate-proto
cd ..

# Generate backend proto files and build
echo "🔨 Building backend..."
cd backend
chmod +x scripts/generate-proto.sh
./scripts/generate-proto.sh

# Update Go dependencies
go mod tidy
go build -o bin/server cmd/server/main.go
cd ..

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Start backend server in background
echo "🌐 Starting backend server..."
cd backend
./bin/server &
cd ..

# Start frontend development server
echo "🖥️ Starting frontend development server..."
cd frontend
npm run dev

echo "✨ Setup complete! The application should now be running."
echo "📝 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:50051"
echo "💾 Database: localhost:5432" 