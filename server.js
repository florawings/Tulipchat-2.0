const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MULTER CONFIG (For Photos/GIFs) ---
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MONGODB CONNECTION ---
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// --- MESSAGE SCHEMA ---
const messageSchema = new mongoose.Schema({
    user: String,
    text: String,
    type: String, // 'text' or 'file'
    gender: String,
    role: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- ROUTES ---
app.post('/auth/login', (req, res) => {
    const { username } = req.body;
    res.redirect(`/chat.html?username=${username}&gender=Male`);
});

app.get('/auth/guest', (req, res) => {
    const guestName = "Guest_" + Math.floor(Math.random() * 9999);
    res.redirect(`/chat.html?username=${guestName}&gender=Male&role=guest`);
});

app.post('/upload', upload.single('chatFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// --- SOCKET.IO LOGIC ---
let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('join', async (data) => {
        socket.username = data.username || 'Guest';
        socket.gender = data.gender || 'Male';
        socket.role = data.role || 'user';

        // Online List Update
        const userExists = onlineUsers.find(u => u.username === socket.username);
        if (!userExists) {
            onlineUsers.push({ 
                username: socket.username, 
                gender: socket.gender, 
                id: socket.id 
            });
        }
        io.emit('updateUserList', onlineUsers);

        // Load Last 100 Messages from DB
        try {
            const history = await Message.find().sort({ timestamp: 1 }).limit(100);
            socket.emit('loadHistory', history);
        } catch (err) {
            console.log("Error loading history:", err);
        }

        console.log(`${socket.username} joined the room`);
    });

    socket.on('sendMessage', async (data) => {
        const msgData = {
            user: socket.username,
            text: data.message,
            type: data.type || 'text',
            gender: socket.gender,
            role: socket.role
        };

        try {
            // Save to Database
            const newMessage = new Message(msgData);
            await newMessage.save();
            
            // Broadcast to Everyone
            io.emit('newMessage', msgData);
        } catch (err) {
            console.log("Error saving message:", err);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
        io.emit('updateUserList', onlineUsers);
        console
        
