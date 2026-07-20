const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Question'
    },
    studentAnswer: String,
    isCorrect: Boolean
  }],
  attemptNumber: {
    type: Number,
    default: 1
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', ResultSchema);
