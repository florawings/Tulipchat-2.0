const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- FILE UPLOAD SETTINGS ---
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB (Aapka connection string sahi hona chahiye)
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

// --- AUTH ROUTES ---
app.post('/auth/login', (req, res) => {
    // Simple redirect for testing
    res.redirect(`/chat.html?username=${req.body.username}&gender=Male`);
});

app.get('/auth/guest', (req, res) => {
    const guestName = "Guest_" + Math.floor(Math.random() * 9999);
    res.redirect(`/chat.html?username=${guestName}&gender=Male&role=guest`);
});

app.post('/auth/register', (req, res) => {
    res.redirect(`/chat.html?username=${req.body.username}&gender=${req.body.gender}`);
});

// Photo/GIF Upload API
app.post('/upload', upload.single('chatFile'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Socket logic
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.username;
        socket.role = data.role || 'user';
        io.emit('newMessage', { user: 'System', text: `${data.username} joined the chat`, type: 'text' });
    });

    socket.on('sendMessage', (data) => {
        io.emit('newMessage', { 
            user: socket.username, 
            text: data.message, 
            type: data.type, 
            role: socket.role 
        });
    });
});

server.listen(process.env.PORT || 3000, () => console.log("🚀 Server Live"));
            
