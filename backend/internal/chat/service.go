package chat

import (
	"context"
	"sync"

	pb "chat-app/proto"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Service struct {
	pb.UnimplementedChatServiceServer
	mu       sync.RWMutex
	users    map[string]*pb.User
	messages []*pb.Message
}

func NewService() *Service {
	return &Service{
		users:    make(map[string]*pb.User),
		messages: make([]*pb.Message, 0),
	}
}

func (s *Service) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if username already exists
	for _, user := range s.users {
		if user.Username == req.Username {
			return nil, status.Error(codes.AlreadyExists, "username already exists")
		}
	}

	// Create new user
	userID := uuid.New().String()
	user := &pb.User{
		Id:       userID,
		Username: req.Username,
		Email:    req.Email,
	}

	s.users[userID] = user

	return &pb.RegisterResponse{
		User:  user,
		Token: userID, // Using userID as token for simplicity
	}, nil
}

func (s *Service) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Find user by username
	for _, user := range s.users {
		if user.Username == req.Username {
			return &pb.LoginResponse{
				User:  user,
				Token: user.Id, // Using userID as token for simplicity
			}, nil
		}
	}

	return nil, status.Error(codes.NotFound, "user not found")
}

func (s *Service) SendMessage(ctx context.Context, msg *pb.Message) (*pb.Empty, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Validate user
	if _, exists := s.users[msg.SenderId]; !exists {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Add message to history
	s.messages = append(s.messages, msg)

	return &pb.Empty{}, nil
}

func (s *Service) JoinChat(req *pb.JoinRequest, stream pb.ChatService_JoinChatServer) error {
	// Validate user
	s.mu.RLock()
	if _, exists := s.users[req.UserId]; !exists {
		s.mu.RUnlock()
		return status.Error(codes.NotFound, "user not found")
	}
	s.mu.RUnlock()

	// Send existing messages
	s.mu.RLock()
	for _, msg := range s.messages {
		if err := stream.Send(msg); err != nil {
			s.mu.RUnlock()
			return err
		}
	}
	s.mu.RUnlock()

	// Keep the stream open
	<-stream.Context().Done()
	return nil
} 