const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Report = require('../models/Report');

// 1. Get All Users (Admin Dashboard ke liye)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username role isBanned lastSeen');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// 2. Ban/Unban User Logic
router.post('/toggle-ban', async (req, res) => {
    const { userId, status } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { isBanned: status });
        res.json({ success: true, message: `User ${status ? 'Banned' : 'Unbanned'} successfully` });
    } catch (err) {
        res.status(500).json({ success: false, message: "Action failed" });
    }
});

// 3. View All Reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find().populate('reporter reportedUser');
        res.json(reports);
    } catch (err) {
        res.status(500).send("Error fetching reports");
    }
});

// 4. Global Announcement Logic
router.post('/broadcast', (req, res) => {
    const { message } = req.body;
    // Socket.io ka use karke sabko message jayega (Logic server.js mein hai)
    req.app.get('socketio').emit('newMessage', { 
        user: 'ADMIN', 
        text: message, 
        role: 'owner',
        type: 'system' 
    });
    res.json({ success: true });
});

module.exports = router;
