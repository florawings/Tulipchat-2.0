const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Ye line zaroori hai taaki aapki HTML file Render par dikhe
app.use(express.static(path.join(__dirname))); 

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ Connection Error:', err));

// Routes
// Registration Route
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and Password are required" });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "Account Created! Now Login." });
    } catch (err) {
        res.status(400).json({ message: "Username already taken!" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ message: "Welcome back!", username: user.username });
        } else {
            res.status(401).json({ message: "Wrong details!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Server Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Tulip Hot Engine running on port ${PORT}`);
});
