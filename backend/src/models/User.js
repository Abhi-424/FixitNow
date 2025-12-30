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
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    address: {
      type: String
    }
  },
  availability: [{
    date: {
      type: String, // Format: YYYY-MM-DD
    },
    slots: [{
      type: String // Format: HH:mm
    }]
  }],
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Blocked', 'Verified'],
    default: 'Pending' 
  },
  servicesOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  experience: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  lastAssignedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;
