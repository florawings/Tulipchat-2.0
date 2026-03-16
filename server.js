const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io with Auto-Recovery
const io = new Server(server, {
    cors: { origin: "*" },
    connectionStateRecovery: {}
});

// --- DATABASE CONNECTION (SAFE MODE) ---
// Yahan apna link dalein ya Render Environment Variable ka use karein
const dbURI = process.env.MONGO_URI || "mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.abc.mongodb.net/tulipchat?retryWrites=true&w=majority";

mongoose.set('strictQuery', false);
mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
        console.log("⚠️ DB Connection Failed, but Server is staying UP.");
        console.log("Error Detail: " + err.message);
    });

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES ---
// Agar ye files miss hongi toh server crash karega, dhyan rakhna
try {
    const authRoutes = require('./routes/auth');
    const adminRoutes = require('./routes/admin');
    const friendRoutes = require('./routes/friends');
    const shopRoutes = require('./routes/shop');

    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/friends', friendRoutes);
    app.use('/shop', shopRoutes);
} catch (e) {
    console.log("⚠️ One or more route files are missing: " + e.message);
}

// --- SOCKET LOGIC ---
const chatSocket = require('./sockets/chatSocket');
chatSocket(io);
app.set('socketio', io);

// --- RENDER PORT BINDING ---
// Render ko 0.0.0.0 binding chahiye hoti hai 502 error se bachne ke liye
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tulip Hot Engine running on port ${PORT}`);
});
