import * as jspb from 'google-protobuf'



export class RegisterRequest extends jspb.Message {
  getUsername(): string;
  setUsername(value: string): RegisterRequest;

  getPassword(): string;
  setPassword(value: string): RegisterRequest;

  getEmail(): string;
  setEmail(value: string): RegisterRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterRequest): RegisterRequest.AsObject;
  static serializeBinaryToWriter(message: RegisterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterRequest;
  static deserializeBinaryFromReader(message: RegisterRequest, reader: jspb.BinaryReader): RegisterRequest;
}

export namespace RegisterRequest {
  export type AsObject = {
    username: string,
    password: string,
    email: string,
  }
}

export class LoginRequest extends jspb.Message {
  getUsername(): string;
  setUsername(value: string): LoginRequest;

  getPassword(): string;
  setPassword(value: string): LoginRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
  static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginRequest;
  static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
  export type AsObject = {
    username: string,
    password: string,
  }
}

export class AuthResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): AuthResponse;

  getToken(): string;
  setToken(value: string): AuthResponse;

  getError(): string;
  setError(value: string): AuthResponse;

  getUserId(): string;
  setUserId(value: string): AuthResponse;

  getUsername(): string;
  setUsername(value: string): AuthResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuthResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AuthResponse): AuthResponse.AsObject;
  static serializeBinaryToWriter(message: AuthResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuthResponse;
  static deserializeBinaryFromReader(message: AuthResponse, reader: jspb.BinaryReader): AuthResponse;
}

export namespace AuthResponse {
  export type AsObject = {
    success: boolean,
    token: string,
    error: string,
    userId: string,
    username: string,
  }
}

export class Message extends jspb.Message {
  getId(): string;
  setId(value: string): Message;

  getFromUser(): string;
  setFromUser(value: string): Message;

  getContent(): string;
  setContent(value: string): Message;

  getTimestamp(): number;
  setTimestamp(value: number): Message;

  getType(): MessageType;
  setType(value: MessageType): Message;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    id: string,
    fromUser: string,
    content: string,
    timestamp: number,
    type: MessageType,
  }
}

export class MessageResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): MessageResponse;

  getError(): string;
  setError(value: string): MessageResponse;

  getMessage(): Message | undefined;
  setMessage(value?: Message): MessageResponse;
  hasMessage(): boolean;
  clearMessage(): MessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MessageResponse): MessageResponse.AsObject;
  static serializeBinaryToWriter(message: MessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageResponse;
  static deserializeBinaryFromReader(message: MessageResponse, reader: jspb.BinaryReader): MessageResponse;
}

export namespace MessageResponse {
  export type AsObject = {
    success: boolean,
    error: string,
    message?: Message.AsObject,
  }
}

export class JoinRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): JoinRequest;

  getToken(): string;
  setToken(value: string): JoinRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JoinRequest): JoinRequest.AsObject;
  static serializeBinaryToWriter(message: JoinRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinRequest;
  static deserializeBinaryFromReader(message: JoinRequest, reader: jspb.BinaryReader): JoinRequest;
}

export namespace JoinRequest {
  export type AsObject = {
    userId: string,
    token: string,
  }
}

export class ChatUpdate extends jspb.Message {
  getMessage(): Message | undefined;
  setMessage(value?: Message): ChatUpdate;
  hasMessage(): boolean;
  clearMessage(): ChatUpdate;

  getStatusUpdate(): UserStatusUpdate | undefined;
  setStatusUpdate(value?: UserStatusUpdate): ChatUpdate;
  hasStatusUpdate(): boolean;
  clearStatusUpdate(): ChatUpdate;

  getUpdateCase(): ChatUpdate.UpdateCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChatUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChatUpdate): ChatUpdate.AsObject;
  static serializeBinaryToWriter(message: ChatUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChatUpdate;
  static deserializeBinaryFromReader(message: ChatUpdate, reader: jspb.BinaryReader): ChatUpdate;
}

export namespace ChatUpdate {
  export type AsObject = {
    message?: Message.AsObject,
    statusUpdate?: UserStatusUpdate.AsObject,
  }

  export enum UpdateCase { 
    UPDATE_NOT_SET = 0,
    MESSAGE = 1,
    STATUS_UPDATE = 2,
  }
}

export class UserStatusUpdate extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UserStatusUpdate;

  getUsername(): string;
  setUsername(value: string): UserStatusUpdate;

  getOnline(): boolean;
  setOnline(value: boolean): UserStatusUpdate;

  getTimestamp(): number;
  setTimestamp(value: number): UserStatusUpdate;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserStatusUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: UserStatusUpdate): UserStatusUpdate.AsObject;
  static serializeBinaryToWriter(message: UserStatusUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserStatusUpdate;
  static deserializeBinaryFromReader(message: UserStatusUpdate, reader: jspb.BinaryReader): UserStatusUpdate;
}

export namespace UserStatusUpdate {
  export type AsObject = {
    userId: string,
    username: string,
    online: boolean,
    timestamp: number,
  }
}

export enum MessageType { 
  TEXT = 0,
  SYSTEM = 1,
  USER_JOIN = 2,
  USER_LEAVE = 3,
}
