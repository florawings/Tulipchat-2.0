const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // HTML file isme honi chahiye

// Default Database Connect (Optional, messages save karne ke liye bad mein use karenge)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI);

// Socket Logic
io.on('connection', (socket) => {
    console.log('⚡ A user connected');

    // Message/Image Receive karo aur sabko bhejo
    socket.on('chatMessage', (data) => {
        // data mein username, text, image, signature hota hai
        io.emit('chatMessage', data); 
    });

    socket.on('disconnect', () => {
        console.log('👤 User disconnected');
    });
});

// Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Tulip Hot Engine running on port ${PORT}`);
});
