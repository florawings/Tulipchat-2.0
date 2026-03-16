const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('YOUR_MONGODB_URL')
  .then(async () => {
    console.log('✅ Connected to DB');
    // Lord_lucifer ko Owner banana
    await User.findOneAndUpdate({ username: "Lord_lucifer" }, { role: 'owner' });
  });

const chatSocket = require('./sockets/chatSocket');
io.on('connection', (socket) => {
    chatSocket(io, socket);
});

server.listen(3000, () => console.log('🚀 Server running on port 3000'));
