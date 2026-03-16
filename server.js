const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Storage for Pics/GIFs
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

// Message Schema (To keep chat history)
const messageSchema = new mongoose.Schema({
    user: String,
    text: String,
    type: String,
    role: String,
    gender: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/auth/login', (req, res) => {
    res.redirect(`/chat.html?username=${req.body.username}&gender=Male`);
});

app.get('/auth/guest', (req, res) => {
    const guestName = "Guest_" + Math.floor(Math.random() * 9999);
    res.redirect(`/chat.html?username=${guestName}&gender=Male&role=guest`);
});

app.post('/upload', upload.single('chatFile'), (req, res) => {
    if (!req.file) return res.status(400).send('Upload failed');
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Socket Logic
io.on('connection', async (socket) => {
    socket.on('join', async (data) => {
        socket.username = data.username;
        socket.role = data.role || 'user';
        socket.gender = data.gender || 'Male';

        // Load History
        const history = await Message.find().sort({ timestamp: 1 }).limit(100);
        socket.emit('loadHistory', history);

        io.emit('newMessage', { user: 'System', text: `${data.username} joined`, type: 'text' });
    });

    socket.on('sendMessage', async (data) => {
        const msg = new Message({
            user: socket.username,
            text: data.message,
            type: data.type,
            role: socket.role,
            gender: socket.gender
        });
        await msg.save();
        io.emit('newMessage', msg);
    });

    socket.on('clearChat', async () => {
        if(socket.role === 'owner') {
            await Message.deleteMany({});
            io.emit('clearChatUI');
        }
    });
});

server.listen(process.env.PORT || 3000, () => console.log("🚀 Server Running"));
