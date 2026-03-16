const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Roles: user, mod, admin, owner
  role: { 
    type: String, 
    enum: ['user', 'mod', 'admin', 'owner'], 
    default: 'user' 
  },
  isBanned: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
