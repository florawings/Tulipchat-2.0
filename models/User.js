const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'mod', 'admin', 'owner'], 
    default: 'user' 
  },
  isBanned: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
