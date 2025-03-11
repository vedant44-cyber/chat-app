#!/bin/bash

set -e # Exit on error

# Create proto output directory if it doesn't exist
mkdir -p proto

# Install protoc-gen-go and protoc-gen-go-grpc if not already installed
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Add GOPATH/bin to PATH
export PATH="$PATH:$(go env GOPATH)/bin"

echo "Generating Go proto files..."

# Generate Go code from proto files directly in the proto directory
protoc -I=../proto \
    --go_out=. \
    --go_opt=module=chat-app \
    --go-grpc_out=. \
    --go-grpc_opt=module=chat-app \
    ../proto/*.proto

# Move generated files to the correct location
mkdir -p ../proto
mv proto/*.pb.go ../proto/

echo "Proto generation completed successfully" 