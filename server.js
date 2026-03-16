const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ CORRECTED MONGODB URL (Small 'm' and optimized for Render)
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    
    // Auto-Owner Assignment
    await User.findOneAndUpdate(
      { username: "Lord_lucifer" }, 
      { role: 'owner' },
      { upsert: false }
    );
    console.log("👑 Lord_lucifer role verified");
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Socket.io Logic
const chatSocket = require('./sockets/chatSocket');
io.on('connection', (socket) => {
    chatSocket(io, socket);
});

// Render Dynamic Port handling
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
