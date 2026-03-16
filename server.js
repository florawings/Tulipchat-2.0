const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with 24/7 connection recovery
const io = new Server(server, {
    cors: { origin: "*" },
    connectionStateRecovery: {} 
});

// --- DATABASE CONNECTION ---
// Yahan apna MongoDB link paste karein (Network Access mein 0.0.0.0/0 allow hona chahiye)
const dbURI = process.env.MONGO_URI || "mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.abc.mongodb.net/tulipchat?retryWrites=true&w=majority";

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected: All Systems Go!"))
.catch(err => {
    console.error("❌ MongoDB Connection Error: ", err.message);
    // Server ko crash hone se bachane ke liye (502 error fix)
});

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES CONNECTION ---
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const friendRoutes = require('./routes/friends');
const shopRoutes = require('./routes/shop');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/friends', friendRoutes);
app.use('/shop', shopRoutes);

// --- SOCKET.IO LOGIC ---
const chatSocket = require('./sockets/chatSocket');
chatSocket(io);

// Setting socket instance for global access
app.set('socketio', io);

// --- SEO & SITE HEALTH ---
app.get('/health', (req, res) => res.status(200).send('Server is alive!'));

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tulip Hot Live on Port ${PORT}`);
});
