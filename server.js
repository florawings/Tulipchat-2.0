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

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    gender: String
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    user: String, text: String, type: String, gender: String, timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- ROUTES ---
// Registration Fix
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password, gender } = req.body;
        const newUser = new User({ username, password, gender });
        await newUser.save();
        res.redirect(`/chat.html?username=${username}&gender=${gender}`);
    } catch (err) {
        res.status(500).send("User already exists or DB error");
    }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) res.redirect(`/chat.html?username=${user.username}&gender=${user.gender}`);
    else res.send("Invalid Login");
});

// File Upload Logic
const upload = multer({ dest: 'public/uploads/' });
app.post('/upload', upload.single('chatFile'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

// --- SOCKET LOGIC ---
let onlineUsers = [];

io.on('connection', (socket) => {
    socket.on('join', async (data) => {
        socket.username = data.username;
        socket.gender = data.gender;

        // Update Online List
        if (!onlineUsers.find(u => u.username === socket.username)) {
            onlineUsers.push({ username: socket.username, gender: socket.gender, id: socket.id });
        }
        io.emit('updateUserList', onlineUsers);

        // Load History
        const history = await Message.find().sort({ timestamp: 1 }).limit(50);
        socket.emit('loadHistory', history);
    });

    socket.on('sendMessage', async (data) => {
        const msg = new Message({
            user: socket.username,
            text: data.message,
            type: data.type || 'text',
            gender: socket.gender
        });
        await msg.save();
        io.emit('newMessage', msg);
    });

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
        io.emit('updateUserList', onlineUsers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
