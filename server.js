const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (Render ke Environment Variables mein MONGO_URI daalein)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("VibeDB Connected"))
  .catch(err => console.log("DB Error:", err));

// Socket Logic
io.on('connection', (socket) => {
    socket.on('join-global', () => {
        socket.join('global-room');
    });

    socket.on('send-global', (data) => {
        io.to('global-room').emit('receive-global', data);
    });

    socket.on('join-private', (userId) => {
        socket.join(userId);
    });

    socket.on('send-private', (data) => {
        // data.toId user ka unique ID hai
        socket.to(data.toId).emit('receive-private', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`VibeChat running on ${PORT}`));
