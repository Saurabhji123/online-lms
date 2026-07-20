const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  textSubmission: {
    type: String
  },
  fileUrl: {
    type: String // URL to PDF/ZIP submission
  },
  marks: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['submitted', 'evaluated'],
    default: 'submitted'
  }
});

// Ensure a student can only submit once per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
