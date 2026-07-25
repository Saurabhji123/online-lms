const express = require('express');
const {
  createAssignment,
  getCourseAssignments,
  deleteAssignment,
  getAllAssignments
} = require('../controllers/assignmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getAllAssignments);
router.post('/', protect, authorize('evaluator', 'admin'), upload.array('attachments', 5), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteAssignment);

module.exports = router;
