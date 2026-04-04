const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    maxHttpBufferSize: 1e7 // 10MB (Photos/GIFs ke liye)
});

app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = ["Ravindra", "Admin", "User_01"];

io.on('connection', (socket) => {
    socket.emit('update-users', onlineUsers);

    socket.on('chat-msg', (data) => {
        io.emit('new-msg', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`VibeChat Live on ${PORT}`));
