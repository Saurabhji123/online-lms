const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Please specify maximum marks']
  },
  attachments: [String], // File URLs
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
