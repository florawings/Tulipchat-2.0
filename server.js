const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    maxHttpBufferSize: 1e8, // 100MB tak ki files allowed
    cors: { origin: "*" } 
});

app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = new Map();

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.username || "Guest";
        socket.role = data.role || "user"; 
        onlineUsers.set(socket.id, { name: socket.username, role: socket.role });
        
        io.emit('updateUserCount', onlineUsers.size);
        io.emit('newMessage', { 
            user: 'SYSTEM', 
            text: `${socket.username} ne entry li! 🔥`, 
            type: 'system' 
        });
    });

    socket.on('sendMessage', (data) => {
        // Advanced Logic: Message ko database mein save karne ka hook yahan aayega
        io.emit('newMessage', {
            user: socket.username,
            role: socket.role,
            text: data.text,
            type: data.type || 'text',
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('updateUserCount', onlineUsers.size);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Engine Started on Port ${PORT}`));
