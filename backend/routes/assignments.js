const express = require('express');
const {
  createAssignment,
  getCourseAssignments,
  deleteAssignment
} = require('../controllers/assignmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('instructor', 'admin'), upload.array('attachments', 5), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAssignment);

module.exports = router;
