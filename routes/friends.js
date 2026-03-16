const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');

// Send Request
router.post('/send-request', async (req, res) => {
    const { senderId, receiverId } = req.body;
    const newReq = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newReq.save();
    res.json({ success: true, msg: "Request Sent!" });
});

// Accept Request
router.post('/accept-request', async (req, res) => {
    const { requestId } = req.body;
    await FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' });
    res.json({ success: true, msg: "Now Friends!" });
});

module.exports = router;
