FROM golang:1.22-alpine

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main ./cmd/server

# Expose port 9090
EXPOSE 9090

# Command to run the executable
CMD ["./main"] 