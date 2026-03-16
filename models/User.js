const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // user, vip, owner
    bio: { type: String, default: "Feeling hot!" },
    profilePic: { type: String, default: "/default-avatar.png" },
    coins: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
