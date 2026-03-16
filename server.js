const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config(); // Connection string ko secure rakhne ke liye

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    connectionStateRecovery: {} // Ye line 24/7 connection recovery ke liye hai
});

// --- FOLDER CONNECTIONS ---

// 1. Database Connection (MongoDB)
const dbURI = process.env.MONGO_URI || 'Aapka_Mongo_Atlas_Link_Yahan';
mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Connected: All Models are active."))
    .catch(err => console.log("❌ DB Connection Error: ", err));

// 2. Middleware & Static Files (Public Folder Connect)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 3. Routing Connections (Routes Folder Connect)
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const friendRoutes = require('./routes/friends');
const shopRoutes = require('./routes/shop');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/friends', friendRoutes);
app.use('/shop', shopRoutes);

// 4. Socket.io Connection (Sockets Folder Connect)
const chatSocket = require('./sockets/chatSocket');
chatSocket(io); // Io instance pass kar rahe hain taaki connection bana rahe

// 5. Global variable for Socket access in Routes
app.set('socketio', io);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Engine Live: tulip-hot.onrender.com`);
});
