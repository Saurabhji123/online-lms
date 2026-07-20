const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please specify quiz duration']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Please specify maximum marks']
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
