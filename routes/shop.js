const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Send Gift Logic
router.post('/send-gift', async (req, res) => {
    const { senderId, receiverId, giftValue } = req.body;

    try {
        const sender = await User.findById(senderId);
        if (sender.coins < giftValue) {
            return res.json({ success: false, msg: "Coins khatam ho gaye! Recharge karo." });
        }

        // Coins transfer logic
        await User.findByIdAndUpdate(senderId, { $inc: { coins: -giftValue } });
        await User.findByIdAndUpdate(receiverId, { $inc: { coins: giftValue } });

        res.json({ success: true, msg: "Gift Sent! 🔥" });
    } catch (err) {
        res.status(500).send("Gifting Error");
    }
});

module.exports = router;
