# Real-time Chat Application

A real-time chat application built with React, Go, and gRPC. This application demonstrates the use of modern web technologies and microservices architecture.

## Features

- Real-time messaging using gRPC streaming
- User authentication (signup/login)
- Message history
- Containerized services using Docker
- AWS deployment ready

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Go 1.21+ (for local development)
- PostgreSQL (handled by Docker)

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Go gRPC server
├── proto/            # Protocol buffer definitions
└── docker-compose.yml # Docker compose configuration
```

## Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. Start the services using Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend gRPC server: localhost:50051

## Local Development

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

## Deployment

### AWS Deployment Steps

1. Create an EC2 instance
2. Install Docker and Docker Compose
3. Clone the repository
4. Configure environment variables
5. Run docker-compose up

Detailed deployment guide coming soon.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
