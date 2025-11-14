const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  }
}, { _id: false }); // disables automatic _id for subdocuments

const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required!']
  },
  whatsappFlowId: {
    type: String
  },
  whatsappFlowState: {
    type: String,
    enum: ['Draft', 'Published', 'Deprecated']
  },
  restaurantId: {
    type: String,
    required: [true, 'Restaurant ID is required!']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required!'],
    enum: ['daily', 'twice-daily', 'custom']
  },
  questions: {
    type: [questionSchema], // array of questions
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);
