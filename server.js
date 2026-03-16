const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const User = require('./models/User'); // Path check kar lena

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const MONGO_URI = 'Aapka_MongoDB_URL_Yahan'; // Apna URL daalein

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Database Connected');
    
    // 👑 Auto-Owner Logic: Lord_lucifer ko Boss banana
    const ownerName = "Lord_lucifer";
    const user = await User.findOne({ username: ownerName });
    if (user) {
      await User.findOneAndUpdate({ username: ownerName }, { role: 'owner' });
      console.log(`👑 Success: ${ownerName} is now the Owner.`);
    } else {
      console.log(`⚠️ Note: ${ownerName} account not found. Please register first.`);
    }
  })
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes (Jo aapki routes folder mein hain)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Socket Logic Connection
const chatSocket = require('./sockets/chatSocket');
io.on('connection', (socket) => {
  // socket.userId set karne ka logic (Authentication ke baad)
  chatSocket(io, socket);
});

// Server Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
