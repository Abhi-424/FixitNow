const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Home Repairs', 'AC Repair', 'Painting', 'Cleaning', 'Carpentry', 'Pest Control', 'Gardening', 'Technology', 'Appliance', 'Pets', 'Moving', 'Decorating', 'Event', 'Other']
  },
  basePrice: {
    type: Number,
    required: true,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
