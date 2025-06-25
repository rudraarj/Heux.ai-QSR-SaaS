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
    required: true
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
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
