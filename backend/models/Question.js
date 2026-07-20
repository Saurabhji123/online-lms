const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'True/False', 'FillInTheBlank', 'ShortAnswer'],
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Please add question text']
  },
  options: [String], // Used for MCQ options
  correctAnswer: {
    type: String, // String representation of the correct answer
    required: [true, 'Please specify the correct answer']
  },
  marks: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
