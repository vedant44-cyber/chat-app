package main

import (
	"log"
	"net"
	"os"

	"chat-app/internal/chat"
	pb "chat-app/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

const (
	defaultPort = ":50051"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	
	// Register our chat service
	chatService := chat.NewService()
	pb.RegisterChatServiceServer(s, chatService)
	
	// Enable reflection for debugging
	reflection.Register(s)

	log.Printf("Server listening on %s", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
} 