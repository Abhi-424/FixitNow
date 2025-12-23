const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: false,
  },
    role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Blocked', 'Verified'],
    default: 'Active'
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
