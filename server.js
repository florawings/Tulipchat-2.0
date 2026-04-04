const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. Configurations
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: { origin: "*" }
});

// 2. Middlewares
app.use(cors());
app.use(express.json()); // JSON data handle karne ke liye
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Frontend files ke liye
app.use('/uploads', express.static('uploads')); // Images/Files ke liye

// 3. Database Connection (MongoDB Atlas)
// Note: Render par MONGO_URI variable zaroor set karein
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vibechat';
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ VibeDB (MongoDB) Connected Successfully!"))
.catch(err => console.error("❌ DB Connection Error:", err));

// 4. Routes Import
const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users'); // Agar aapne banaya hai

app.use('/api/auth', authRoutes);

// 5. Socket.io Real-time Logic (The Heart of VibeChat)
const users = {}; // Online users ko track karne ke liye

io.on('connection', (socket) => {
    console.log('🚀 New Connection:', socket.id);

    // User online aane par
    socket.on('user-online', (userData) => {
        socket.userId = userData.id;
        users[userData.id] = socket.id; // User ID ko Socket ID se map karna
        socket.join('global-square'); // Sabko Global room mein daalna
        
        io.emit('update-user-list', Object.keys(users)); 
        console.log(`User ${userData.name} is now online.`);
    });

    // A. Global Messaging
    socket.on('send-global-msg', (data) => {
        // data mein senderName aur text hoga
        io.to('global-square').emit('receive-global-msg', {
            user: data.user,
            text: data.text,
            time: new Date().toLocaleTimeString()
        });
    });

    // B. Private Messaging (Direct Message)
    socket.on('send-private-msg', (data) => {
        const recipientSocketId = users[data.toUserId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive-private-msg', {
                fromUser: data.fromUser,
                fromUserId: data.fromUserId,
                text: data.text
            });
        }
    });

    // C. Disconnect Logic
    socket.on('disconnect', () => {
        if (socket.userId) {
            delete users[socket.userId];
            io.emit('update-user-list', Object.keys(users));
            console.log('User Disconnected:', socket.userId);
        }
    });
});

// 6. Server Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🔥 VibeChat is LIVE!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
