const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedProviders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastAssignedAt: {
    type: Date
  },
  service: {
    type: String,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Auto-Assigned', 'Accepted', 'In Progress', 'Waiting for Confirmation', 'Completed', 'Cancelled', 'Declined'],
    default: 'Pending'
  },
  technicianCompleted: {
    type: Boolean,
    default: false
  },
  userConfirmed: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
