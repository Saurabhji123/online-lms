const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  fileUrl: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
