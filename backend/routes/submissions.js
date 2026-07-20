const express = require('express');
const {
  submitAssignment,
  getAssignmentSubmissions,
  evaluateSubmission
} = require('../controllers/submissionController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('student'), upload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId', protect, authorize('instructor', 'admin'), getAssignmentSubmissions);
router.put('/:id/evaluate', protect, authorize('instructor', 'admin'), evaluateSubmission);

module.exports = router;
