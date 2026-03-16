const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected Successfully"));

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: String,
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

// --- AUTH ROUTES (Fixed Login Issue) ---

// Registration Route
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password, gender } = req.body;
        // Check if user already exists
        const check = await User.findOne({ username });
        if(check) return res.send("<script>alert('User already exists!'); window.location='/register.html';</script>");

        const role = (username.toLowerCase() === 'lord_lucifer') ? 'owner' : 'user';
        const newUser = new User({ username, password, gender, role });
        await newUser.save();
        
        // Redirecting to chat with full credentials
        res.redirect(`/chat.html?username=${username}&gender=${gender}&role=${role}`);
    } catch (err) {
        res.status(500).send("Registration Error");
    }
});

// Login Route (Fixed Persistent Login)
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Case-insensitive check and password match
        const user = await User.findOne({ 
            username: { $regex: new RegExp("^" + username + "$", "i") }, 
            password: password 
        });

        if (user) {
            console.log(`✅ Login Success: ${user.username}`);
            res.redirect(`/chat.html?username=${user.username}&gender=${user.gender}&role=${user.role}`);
        } else {
            res.send("<script>alert('Invalid Username or Password'); window.location='/index.html';</script>");
        }
    } catch (err) {
        res.status(500).send("Login Error");
    }
});

// --- SOCKET LOGIC ---
let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.username;
        socket.gender = data.gender;
        socket.role = data.role;
        
        onlineUsers[socket.id] = { username: data.username, gender: data.gender, role: data.role };
        io.emit('updateUserList', Object.values(onlineUsers));
    });

    socket.on('sendMessage', (data) => {
        const msg = {
            user: socket.username,
            text: data.message,
            gender: socket.gender,
            role: socket.role,
            to: data.to || 'all'
        };

        if (data.to && data.to !== 'all') {
            const targetId = Object.keys(onlineUsers).find(id => onlineUsers[id].username === data.to);
            if (targetId) {
                io.to(targetId).emit('newMessage', msg);
                socket.emit('newMessage', msg); 
            }
        } else {
            io.emit('newMessage', msg);
        }
    });

    socket.on('adminClear', () => {
        if (socket.role === 'owner') io.emit('clearScreen');
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('updateUserList', Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
                                            
