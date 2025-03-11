import React, { useState } from 'react';
import { Box, Button, Container, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChatServiceClient } from "../proto/proto/ChatServiceClientPb";
import * as chat_pb from "../proto/proto/chat_pb";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const client = new ChatServiceClient('http://localhost:8080', null, null);

export function Auth() {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const request = new chat_pb.RegisterRequest();
    request.setUsername(username);
    request.setPassword(password);
    request.setEmail(email);

    try {
      const response = await new Promise<chat_pb.AuthResponse>((resolve, reject) => {
        client.register(request, null, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      });

      // Store token and navigate to chat
      localStorage.setItem('token', response.getToken());
      localStorage.setItem('userId', response.getUserId());
      localStorage.setItem('username', response.getUsername());
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const request = new chat_pb.LoginRequest();
    request.setUsername(username);
    request.setPassword(password);

    try {
      const response = await new Promise<chat_pb.AuthResponse>((resolve, reject) => {
        client.login(request, null, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      });

      // Store token and navigate to chat
      localStorage.setItem('token', response.getToken());
      localStorage.setItem('userId', response.getUserId());
      localStorage.setItem('username', response.getUsername());
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Chat App
        </Typography>
        <Box sx={{ width: '100%', mt: 3 }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
            </Box>
          </TabPanel>

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
} 