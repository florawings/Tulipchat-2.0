const express = require('express');
const router = express.Router();
const User = require('../models/User');

// SIGNUP ROUTE
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password }); // Ideally password should be hashed
        await user.save();
        res.json({ msg: 'Registration Successful', userId: user._id });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        res.json({ msg: 'Login Success', user: { id: user._id, name: user.username } });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
