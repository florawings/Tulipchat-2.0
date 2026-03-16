const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Guest ke liye optional
  email: { type: String },
  age: { type: Number },
  gender: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'owner', 'guest'], 
    default: 'user' 
  },
  isBanned: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
