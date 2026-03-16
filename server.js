const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage for GIFs/Images
const upload = multer({ dest: 'public/uploads/' });

// MongoDB Connection
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ Database Connected"));

// --- Auth Routes (Fixing your "Cannot POST" error) ---
app.post('/auth/register', async (req, res) => {
    try {
        console.log("Registration attempt:", req.body.username);
        // Yahan abhi hum simple redirect kar rahe hain taaki aap login kar sakein
        res.redirect(`/chat.html?username=${req.body.username}&gender=${req.body.gender}`);
    } catch (err) { res.status(500).send("Error"); }
});

app.post('/auth/login', (req, res) => {
    res.redirect(`/chat.html?username=${req.body.username}&gender=Male`);
});

app.get('/auth/guest', (req, res) => {
    const guest = "Guest_" + Math.floor(Math.random()*999);
    res.redirect(`/chat.html?username=${guest}&gender=Male`);
});

// File Upload API
app.post('/upload', upload.single('chatFile'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Real-time Chat
let onlineUsers = {};
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.username;
        onlineUsers[data.username] = { id: socket.id, gender: data.gender };
        io.emit('updateUserList', Object.keys(onlineUsers).map(u => ({
            username: u, gender: onlineUsers[u].gender
        })));
    });

    socket.on('sendMessage', (data) => {
        io.emit('newMessage', { user: socket.username, text: data.message, type: data.type || 'text', gender: onlineUsers[socket.username]?.gender });
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.username];
        io.emit('updateUserList', Object.keys(onlineUsers).map(u => ({ username: u, gender: onlineUsers[u]?.gender })));
    });
});

server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log("🚀 Server Live"));
