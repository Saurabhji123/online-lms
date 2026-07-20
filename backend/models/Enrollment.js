const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  progress: {
    type: Number, // Percentage of lectures watched (0 to 100)
    default: 0
  },
  completedLectures: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture'
  }]
});

// Ensure uniqueness per student and course
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
