import { ChatServiceClient } from '../generated/ChatServiceClientPb';
import {
  RegisterRequest,
  LoginRequest,
  Message,
  JoinRequest,
} from '../generated/chat_pb';

class ChatService {
  private client: ChatServiceClient;

  constructor() {
    this.client = new ChatServiceClient('http://localhost:50051', null, null);
  }

  async register(username: string, password: string, email: string) {
    const request = new RegisterRequest();
    request.setUsername(username);
    request.setPassword(password);
    request.setEmail(email);

    return this.client.register(request, {});
  }

  async login(username: string, password: string) {
    const request = new LoginRequest();
    request.setUsername(username);
    request.setPassword(password);

    return this.client.login(request, {});
  }

  async sendMessage(content: string, fromUser: string) {
    const message = new Message();
    message.setContent(content);
    message.setFromUser(fromUser);
    message.setTimestamp(Date.now());

    return this.client.sendMessage(message, {});
  }

  joinChat(userId: string, token: string, onMessage: (message: Message) => void) {
    const request = new JoinRequest();
    request.setUserId(userId);
    request.setToken(token);

    const stream = this.client.joinChat(request, {});
    
    stream.on('data', (response: Message) => {
      onMessage(response);
    });

    stream.on('error', (err: Error) => {
      console.error('Stream error:', err);
    });

    return stream;
  }
}

export const chatService = new ChatService(); 