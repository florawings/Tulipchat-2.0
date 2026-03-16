const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// View engine aur static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const MONGO_URI = 'YOUR_MONGODB_URL_HERE'; // Apna URL yahan daalein
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // Auto-Owner Assignment for Lord_lucifer
    const owner = await User.findOne({ username: "Lord_lucifer" });
    if (owner) {
      await User.findOneAndUpdate({ username: "Lord_lucifer" }, { role: 'owner' });
      console.log("👑 Lord_lucifer is now the System Owner");
    }
  })
  .catch(err => console.log('❌ DB Error:', err));

// Routes
app.use('/auth', require('./routes/auth'));

// Socket Setup
const chatSocket = require('./sockets/chatSocket');
io.on('connection', (socket) => {
    // Note: Login ke waqt socket.userId set hona chahiye
    chatSocket(io, socket);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Chat Server live on port ${PORT}`));
