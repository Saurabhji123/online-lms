const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lectureId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture'
  },
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['PDF', 'PPT', 'DOCX', 'ZIP', 'Link'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
