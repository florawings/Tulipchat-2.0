const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    maxHttpBufferSize: 1e7 // 10MB limit photos ke liye
});

app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = ["Ravindra", "Guest_User", "Admin"]; // Testing ke liye

io.on('connection', (socket) => {
    console.log('User Connected');
    
    // Initial data
    socket.emit('update-users', onlineUsers);

    socket.on('chat-msg', (data) => {
        // Sabko message bhej dena (including photos)
        io.emit('new-msg', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
