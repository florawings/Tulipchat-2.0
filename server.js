const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    // Jab koi join kare
    socket.broadcast.emit('chatMessage', { system: true, text: "Someone joined the room" });

    // Message receive karna
    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data); // Sabko bhejo (sender ko bhi)
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Server on ${PORT}`);
});
