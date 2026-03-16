const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = "mongodb+srv://epffoportal_db_user:wAaE19Wqq3XFMbJH@cluster0.mighbsf.mongodb.net/tulipchat";
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    gender: String,
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    user: String, text: String, type: String, gender: String, to: { type: String, default: 'all' }, timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Registration & Login Fix
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password, gender } = req.body;
        // Lord_lucifer ko owner role dena
        const role = (username.toLowerCase() === 'lord_lucifer') ? 'owner' : 'user';
        const newUser = new User({ username, password, gender, role });
        await newUser.save();
        res.redirect(`/chat.html?username=${username}&gender=${gender}&role=${role}`);
    } catch (err) { res.status(500).send("User already exists"); }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) res.redirect(`/chat.html?username=${user.username}&gender=${user.gender}&role=${user.role}`);
    else res.status(401).send("Invalid Credentials");
});

// Socket Logic with DM & Owner Power
let onlineUsers = {}; // Socket ID as key for DM power

io.on('connection', (socket) => {
    socket.on('join', async (data) => {
        socket.username = data.username;
        socket.gender = data.gender;
        socket.role = data.role;
        
        onlineUsers[socket.id] = { username: data.username, gender: data.gender, role: data.role };
        
        io.emit('updateUserList', Object.values(onlineUsers));

        const history = await Message.find({ to: 'all' }).sort({ timestamp: 1 }).limit(50);
        socket.emit('loadHistory', history);
    });

    socket.on('sendMessage', async (data) => {
        const msg = new Message({
            user: socket.username,
            text: data.message,
            gender: socket.gender,
            to: data.to || 'all'
        });
        await msg.save();

        if (data.to && data.to !== 'all') {
            // DM Logic
            const targetSocketId = Object.keys(onlineUsers).find(id => onlineUsers[id].username === data.to);
            if (targetSocketId) {
                io.to(targetSocketId).emit('newMessage', msg);
                socket.emit('newMessage', msg); // Sender ko bhi dikhe
            }
        } else {
            io.emit('newMessage', msg);
        }
    });

    // Owner Power: Clear Chat
    socket.on('adminClear', async () => {
        if (socket.role === 'owner') {
            await Message.deleteMany({});
            io.emit('clearScreen');
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('updateUserList', Object.values(onlineUsers));
    });
});

server.listen(process.env.PORT || 3000);
                                    
