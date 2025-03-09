// src/server.ts
import { Server } from 'socket.io';
import { AppService } from './app';
import { HttpServerAsService } from '@repo/typex/HttpServerAsService';

const service = AppService();

const server = HttpServerAsService(service);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('event', (data) => {
    console.log('>> ', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
