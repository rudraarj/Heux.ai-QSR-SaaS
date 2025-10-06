const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  passed: {
    type: Boolean,
    required: true,
    default: false
  },
  comment: {
    type: String
  }
}, { _id: false }); // prevent auto _id for each response entry

const inspectionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['passed', 'failed', 'attention'],
    default: 'attention'
  },
  responses: {
    type: [responseSchema], // <-- array of responses
    default: []
  },
  images: {
    type: [String], // <-- array of image URLs
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inspection', inspectionSchema);
