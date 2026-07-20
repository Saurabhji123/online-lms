const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  },
  source: {
    type: String,
    enum: ['LiveSession', 'LectureCompletion', 'Manual'],
    required: true
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
