const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'text' }, // text, image, gif
    roomId: { type: String, default: 'global' }, // 'global' ya DM ID
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
