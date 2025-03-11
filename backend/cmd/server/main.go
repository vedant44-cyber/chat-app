package main

import (
	"log"
	"net"

	"chat-app/internal/chat"
	pb "chat-app/proto"
	"google.golang.org/grpc"
)

func main() {
	// Create a TCP listener
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// Create a new gRPC server
	s := grpc.NewServer()

	// Create and register the chat service
	chatService := chat.NewService()
	pb.RegisterChatServiceServer(s, chatService)

	log.Printf("Starting gRPC server on :9090")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
} 