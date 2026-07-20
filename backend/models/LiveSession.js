const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a session title'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please specify session date and time']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please specify session duration']
  },
  meetingLink: {
    type: String,
    required: [true, 'Please provide the meeting link']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LiveSession', LiveSessionSchema);
