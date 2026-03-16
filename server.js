const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// File Upload Setup
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat");

// API for File Upload
app.post('/upload', upload.single('chatFile'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.username;
        onlineUsers[data.username] = { id: socket.id, gender: data.gender };
        io.emit('updateUserList', Object.keys(onlineUsers).map(u => ({
            username: u, 
            gender: onlineUsers[u].gender 
        })));
    });

    socket.on('sendMessage', (data) => {
        io.emit('newMessage', { 
            user: socket.username, 
            text: data.message, 
            type: data.type || 'text',
            gender: onlineUsers[socket.username]?.gender
        });
    });

    // DM Logic
    socket.on('privateMessage', (data) => {
        const target = onlineUsers[data.to];
        if (target) {
            io.to(target.id).emit('newMessage', { 
                user: `(DM) ${socket.username}`, 
                text: data.message, 
                isPrivate: true 
            });
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.username];
        io.emit('updateUserList', Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0');
