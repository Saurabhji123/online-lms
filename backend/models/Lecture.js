const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a lecture title'],
    trim: true
  },
  description: {
    type: String
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add lecture duration in minutes']
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lecture', LectureSchema);
