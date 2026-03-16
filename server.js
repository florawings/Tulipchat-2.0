const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User'); // Check karein ki path sahi hai

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ Connection Error:', err));

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        res.status(400).json({ message: "Error: Username already exists or data missing" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ message: "Login Successful!", user });
        } else {
            res.status(401).json({ message: "Invalid Username or Password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Tulip Hot Engine running on port ${PORT}`);
});
