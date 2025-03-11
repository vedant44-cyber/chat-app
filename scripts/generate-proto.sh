#!/bin/bash

# Create necessary directories
mkdir -p frontend/src/proto
mkdir -p backend/proto

# Generate Go code
protoc -I=. \
    --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/chat.proto

# Generate TypeScript code
protoc -I=. \
    --js_out=import_style=commonjs,binary:frontend/src/proto \
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:frontend/src/proto \
    proto/chat.proto

# Copy generated Go files to the correct location
mv proto/chat.pb.go backend/proto/
mv proto/chat_grpc.pb.go backend/proto/ 