// src/server.ts
import http from "http";
import {Server} from "socket.io";

const server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello from Node.js backend!");
});

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on('event', data => {
        console.log('>> ', data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});
