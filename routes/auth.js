const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Aapka User Model
const bcrypt = require('bcryptjs');

// Register Logic
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect('/login.html?success=true');
    } catch (err) {
        res.status(500).send("Error creating user");
    }
});

// Login Logic
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        res.redirect(`/chat.html?username=${username}&role=${user.role}`);
    } else {
        res.send("Invalid Username or Password");
    }
});

module.exports = router;
