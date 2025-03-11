package chat

import (
	"context"
	"sync"
	"time"

	pb "chat-app/proto"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const (
	jwtSecret = "your-secret-key" // In production, use environment variable
)

type User struct {
	ID           string
	Username     string
	Email        string
	PasswordHash string
	Online       bool
}

type Service struct {
	pb.UnimplementedChatServiceServer
	mu            sync.RWMutex
	users         map[string]*User
	activeStreams map[string][]pb.ChatService_JoinChatServer
	broadcastCh   chan *pb.ChatUpdate
}

func NewService() *Service {
	s := &Service{
		users:         make(map[string]*User),
		activeStreams: make(map[string][]pb.ChatService_JoinChatServer),
		broadcastCh:   make(chan *pb.ChatUpdate, 100),
	}
	go s.broadcastMessages()
	return s
}

func (s *Service) broadcastMessages() {
	for update := range s.broadcastCh {
		s.mu.RLock()
		for _, streams := range s.activeStreams {
			for _, stream := range streams {
				// Non-blocking send
				go func(str pb.ChatService_JoinChatServer, upd *pb.ChatUpdate) {
					str.Send(upd)
				}(stream, update)
			}
		}
		s.mu.RUnlock()
	}
}

func (s *Service) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.AuthResponse, error) {
	if req.Username == "" || req.Password == "" || req.Email == "" {
		return nil, status.Error(codes.InvalidArgument, "missing required fields")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if username already exists
	for _, user := range s.users {
		if user.Username == req.Username {
			return nil, status.Error(codes.AlreadyExists, "username already exists")
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to hash password")
	}

	// Create new user
	userID := uuid.New().String()
	user := &User{
		ID:           userID,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	s.users[userID] = user

	// Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to generate token")
	}

	return &pb.AuthResponse{
		Success:  true,
		Token:    token,
		UserId:   userID,
		Username: user.Username,
	}, nil
}

func (s *Service) Login(ctx context.Context, req *pb.LoginRequest) (*pb.AuthResponse, error) {
	if req.Username == "" || req.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "missing required fields")
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	// Find user by username
	var user *User
	for _, u := range s.users {
		if u.Username == req.Username {
			user = u
			break
		}
	}

	if user == nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid password")
	}

	// Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to generate token")
	}

	return &pb.AuthResponse{
		Success:  true,
		Token:    token,
		UserId:   user.ID,
		Username: user.Username,
	}, nil
}

func (s *Service) SendMessage(ctx context.Context, msg *pb.Message) (*pb.MessageResponse, error) {
	// Validate authentication
	userID, err := s.authenticateRequest(ctx)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	user, exists := s.users[userID]
	s.mu.RUnlock()
	if !exists {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Create message
	message := &pb.Message{
		Id:        uuid.New().String(),
		FromUser:  user.Username,
		Content:   msg.Content,
		Timestamp: time.Now().Unix(),
		Type:      pb.MessageType_TEXT,
	}

	// Broadcast message
	s.broadcastCh <- &pb.ChatUpdate{
		Update: &pb.ChatUpdate_Message{
			Message: message,
		},
	}

	return &pb.MessageResponse{
		Success: true,
		Message: message,
	}, nil
}

func (s *Service) JoinChat(req *pb.JoinRequest, stream pb.ChatService_JoinChatServer) error {
	// Validate authentication
	if req.Token == "" {
		return status.Error(codes.Unauthenticated, "missing token")
	}

	claims, err := s.validateToken(req.Token)
	if err != nil {
		return status.Error(codes.Unauthenticated, "invalid token")
	}

	userID := claims["user_id"].(string)

	s.mu.Lock()
	user, exists := s.users[userID]
	if !exists {
		s.mu.Unlock()
		return status.Error(codes.NotFound, "user not found")
	}

	// Update user status
	user.Online = true
	s.activeStreams[userID] = append(s.activeStreams[userID], stream)
	s.mu.Unlock()

	// Broadcast user join
	s.broadcastCh <- &pb.ChatUpdate{
		Update: &pb.ChatUpdate_StatusUpdate{
			StatusUpdate: &pb.UserStatusUpdate{
				UserId:    userID,
				Username:  user.Username,
				Online:    true,
				Timestamp: time.Now().Unix(),
			},
		},
	}

	// Wait for client disconnect
	<-stream.Context().Done()

	// Handle disconnect
	s.mu.Lock()
	user.Online = false
	if streams := s.activeStreams[userID]; len(streams) > 0 {
		// Remove this stream
		newStreams := make([]pb.ChatService_JoinChatServer, 0)
		for _, s := range streams {
			if s != stream {
				newStreams = append(newStreams, s)
			}
		}
		if len(newStreams) == 0 {
			delete(s.activeStreams, userID)
		} else {
			s.activeStreams[userID] = newStreams
		}
	}
	s.mu.Unlock()

	// Broadcast user leave
	s.broadcastCh <- &pb.ChatUpdate{
		Update: &pb.ChatUpdate_StatusUpdate{
			StatusUpdate: &pb.UserStatusUpdate{
				UserId:    userID,
				Username:  user.Username,
				Online:    false,
				Timestamp: time.Now().Unix(),
			},
		},
	}

	return nil
}

func (s *Service) generateToken(user *User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})
	return token.SignedString([]byte(jwtSecret))
}

func (s *Service) validateToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, status.Error(codes.Unauthenticated, "invalid token")
}

func (s *Service) authenticateRequest(ctx context.Context) (string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", status.Error(codes.Unauthenticated, "missing metadata")
	}

	tokens := md.Get("authorization")
	if len(tokens) == 0 {
		return "", status.Error(codes.Unauthenticated, "missing token")
	}

	claims, err := s.validateToken(tokens[0])
	if err != nil {
		return "", status.Error(codes.Unauthenticated, "invalid token")
	}

	return claims["user_id"].(string), nil
} 