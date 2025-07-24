// Updated MongoDB schema with additional fields for tracking
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'alternate'],
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Matches HH:mm format (24-hour)
  },
  timeZone: {
    type: String,
    required: true,
    default: 'America/Toronto'
  },
  lastTriggered: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('Notification', notificationSchema);