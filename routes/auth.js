const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// REGISTER Logic
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, age, gender } = req.body;
        let userExists = await User.findOne({ username });
        if (userExists) return res.status(400).send("Username already taken!");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            age,
            gender,
            role: 'user'
        });

        await newUser.save();
        res.redirect('/login.html?msg=Registered successfully');
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// LOGIN Logic
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send("User not found!");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Wrong password!");

        res.redirect(`/chat.html?username=${user.username}&role=${user.role}`);
    } catch (err) {
        res.status(500).send("Login failed");
    }
});

// GUEST LOGIN (No password required)
router.get('/guest', (req, res) => {
    const guestNick = "Guest_" + Math.floor(Math.random() * 9000 + 1000);
    res.redirect(`/chat.html?username=${guestNick}&role=guest`);
});

module.exports = router;
