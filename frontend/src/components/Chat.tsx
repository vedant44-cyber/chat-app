import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChatServiceClient } from "../proto/proto/ChatServiceClientPb";
import * as chat_pb from "../proto/proto/chat_pb";

const client = new ChatServiceClient('http://localhost:8080', null, null);

interface ChatMessage {
  id: string;
  fromUser: string;
  content: string;
  timestamp: number;
  type: 'TEXT' | 'SYSTEM';
}

interface OnlineUser {
  id: string;
  username: string;
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/');
      return;
    }

    const request = new chat_pb.JoinRequest();
    request.setUserId(userId);
    request.setToken(token);

    const stream = client.joinChat(request, {
      Authorization: token,
    });

    stream.on('data', (update: chat_pb.ChatUpdate) => {
      if (update.hasMessage()) {
        const msg = update.getMessage()!;
        setMessages((prev) => [
          ...prev,
          {
            id: msg.getId(),
            fromUser: msg.getFromUser(),
            content: msg.getContent(),
            timestamp: msg.getTimestamp(),
            type: 'TEXT',
          },
        ]);
      } else if (update.hasStatusUpdate()) {
        const status = update.getStatusUpdate()!;
        if (status.getOnline()) {
          setOnlineUsers((prev) => [
            ...prev,
            { id: status.getUserId(), username: status.getUsername() },
          ]);
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              fromUser: 'System',
              content: `${status.getUsername()} joined the chat`,
              timestamp: status.getTimestamp(),
              type: 'SYSTEM',
            },
          ]);
        } else {
          setOnlineUsers((prev) =>
            prev.filter((user) => user.id !== status.getUserId())
          );
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              fromUser: 'System',
              content: `${status.getUsername()} left the chat`,
              timestamp: status.getTimestamp(),
              type: 'SYSTEM',
            },
          ]);
        }
      }
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      setError('Connection error. Please try again.');
    });

    return () => {
      stream.cancel();
    };
  }, [navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const message = new chat_pb.Message();
    message.setContent(messageInput);

    try {
      await new Promise((resolve, reject) => {
        client.sendMessage(message, { Authorization: token }, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      });

      setMessageInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <Container>
      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Chat Room</Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Paper
            sx={{
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <List
              sx={{
                flex: 1,
                overflow: 'auto',
                padding: 2,
              }}
            >
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: msg.type === 'SYSTEM' ? 'center' : 'flex-start',
                  }}
                >
                  {msg.type === 'TEXT' && (
                    <Typography
                      variant="caption"
                      sx={{ alignSelf: 'flex-start', mb: 0.5 }}
                    >
                      {msg.fromUser}
                    </Typography>
                  )}
                  <ListItemText
                    primary={msg.content}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: msg.type === 'SYSTEM' ? 'text.secondary' : 'inherit',
                        fontStyle: msg.type === 'SYSTEM' ? 'italic' : 'normal',
                      },
                    }}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>

            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <Button type="submit" variant="contained">
                Send
              </Button>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ width: 200, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Online Users ({onlineUsers.length})
          </Typography>
          <List dense>
            {onlineUsers.map((user) => (
              <ListItem key={user.id}>
                <ListItemText primary={user.username} />
                <Chip size="small" color="success" label="online" />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
} 