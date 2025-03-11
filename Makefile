.PHONY: install build run dev clean

# Frontend commands
frontend-install:
	cd frontend && npm install --legacy-peer-deps
	cd frontend && npm run install-protoc
	cd frontend && npm run generate-proto

frontend-dev:
	cd frontend && npm run dev

# Backend commands
backend-build:
	cd backend && go build -o bin/server cmd/server/main.go

backend-run:
	cd backend && go run cmd/server/main.go

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# Combined commands
install: frontend-install

dev: docker-up frontend-dev

clean:
	docker-compose down
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	rm -rf backend/bin

# Default command
all: install dev 