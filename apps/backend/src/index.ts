// src/server.ts
import { Server } from 'socket.io';
import { AppService } from './app';
import { HttpServerAsService } from '@slavax/typex/HttpServerAsService';
import { v4 } from 'uuid';

const service = AppService();

const server = HttpServerAsService(service);

const io = new Server(server, {
  cors: {
    origin: '*', // Allow requests from any domain and port
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type'], // Specify allowed headers
    credentials: true, // Allow credentials (cookies, etc.)
  },
});

io.on('connection', (socket) => {
  console.log('New client connected');

  const userId = v4();

  socket.join(userId);

  io.to(userId).emit('notification', { type: 'Hey you connected!!!' });

  socket.on('event', (data) => {
    console.log('>> ', data);
  });

  socket.on('send-message', (message) => {
    console.log('Message from client:', message);
    // io.emit('notification', `New message: ${message}`);
  });

  socket.on('disconnect', () => {
    socket.leave(userId);
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
