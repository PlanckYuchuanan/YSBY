import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ysby-secret-key-change-in-production';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WS_PORT = process.env.WS_PORT || 8080;

// Redis client for message queue and user presence
const redis = new Redis(REDIS_URL);

// Connection management
interface UserConnection {
  ws: WebSocket;
  userId: string;
  socketId: string;
}

const connections = new Map<string, UserConnection>(); // socketId -> UserConnection
const userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

// Message types
interface WSMessage {
  type: string;
  payload: any;
}

interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file';
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  timestamp: number;
}

function broadcastToUser(userId: string, message: WSMessage) {
  const socketIds = userSockets.get(userId);
  if (!socketIds) return;

  socketIds.forEach(socketId => {
    const conn = connections.get(socketId);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToConversation(conversationId: string, message: WSMessage, excludeUserId?: string) {
  // TODO: Get all user IDs in this conversation from Redis
  // For now, broadcast to all connected users
}

async function handleMessage(socketId: string, userId: string, message: WSMessage) {
  switch (message.type) {
    case 'ping':
      // Respond with pong
      const conn = connections.get(socketId);
      if (conn) {
        conn.ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
      }
      break;

    case 'send_message':
      await handleSendMessage(socketId, userId, message.payload);
      break;

    case 'mark_read':
      await handleMarkRead(socketId, userId, message.payload);
      break;

    case 'typing':
      await handleTyping(socketId, userId, message.payload);
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

async function handleSendMessage(socketId: string, userId: string, payload: any) {
  const { conversationId, content, msgType = 'text' } = payload;

  // Create message object
  const msg: ChatMessage = {
    id: uuidv4(),
    type: msgType,
    content,
    senderId: userId,
    receiverId: payload.receiverId || '',
    conversationId,
    timestamp: Date.now()
  };

  // Store message in Redis (temporary) for real-time delivery
  await redis.lpush(`chat:${conversationId}:messages`, JSON.stringify(msg));
  await redis.ltrim(`chat:${conversationId}:messages`, 0, 999); // Keep last 1000 messages

  // TODO: Store message in MySQL for persistence

  // Broadcast message to all users in conversation
  // This would normally go through a message queue like Redis pub/sub
  const response: WSMessage = {
    type: 'new_message',
    payload: msg
  };

  // Send to sender (confirmation)
  const senderConn = connections.get(socketId);
  if (senderConn) {
    senderConn.ws.send(JSON.stringify({
      type: 'message_sent',
      payload: { ...msg, status: 'sent' }
    }));
  }

  // TODO: Send to receiver(s) via pub/sub
}

async function handleMarkRead(socketId: string, userId: string, payload: any) {
  const { conversationId } = payload;

  // Update unread count in Redis
  await redis.set(`unread:${userId}:${conversationId}`, '0');

  // TODO: Update in MySQL

  // Notify the other party
  // TODO: Send read receipt via pub/sub
}

async function handleTyping(socketId: string, userId: string, payload: any) {
  const { conversationId, isTyping } = payload;

  // Broadcast typing status to other users in conversation
  // TODO: Implement typing indicators
}

// Authentication
function authenticateToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  // Parse token from query string
  const { query } = parse(req.url || '', true);
  const token = query.token as string;

  if (!token) {
    ws.close(4001, 'Token required');
    return;
  }

  const decoded = authenticateToken(token);
  if (!decoded) {
    ws.close(4002, 'Invalid token');
    return;
  }

  const { userId } = decoded;
  const socketId = uuidv4();

  // Store connection
  connections.set(socketId, { ws, userId, socketId });

  // Update user sockets map
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socketId);

  // Update presence in Redis
  redis.set(`presence:${userId}`, socketId, 'EX', 300); // 5 minutes expiry

  console.log(`User ${userId} connected with socket ${socketId}`);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    payload: { socketId, userId }
  }));

  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      handleMessage(socketId, userId, message);
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log(`User ${userId} disconnected (socket ${socketId})`);

    // Remove from connections
    connections.delete(socketId);

    // Update user sockets map
    const userSocketSet = userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        userSockets.delete(userId);
      }
    }

    // Remove presence
    redis.del(`presence:${userId}`);
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Heartbeat to keep connections alive
setInterval(async () => {
  // Ping all connections
  connections.forEach((conn) => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.ping();
    }
  });

  // Refresh presence for active users
  connections.forEach((conn) => {
    redis.expire(`presence:${conn.userId}`, 300);
  });
}, 30000);

console.log(`IM WebSocket service running on port ${WS_PORT}`);

export default wss;