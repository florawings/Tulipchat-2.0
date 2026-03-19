const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e7 });

app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Message Schema
const Message = mongoose.model('Message', new mongoose.Schema({
    username: String,
    text: String,
    image: String,
    userColor: String,
    avatarColor: String,
    timestamp: { type: Date, default: Date.now }
}));

io.on('connection', async (socket) => {
    // Purani chat load karein
    const history = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('loadHistory', history);

    socket.on('chatMessage', async (data) => {
        const newMessage = new Message(data);
        await newMessage.save();
        io.emit('chatMessage', data); 
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
