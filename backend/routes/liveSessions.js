const express = require('express');
const {
  getCourseSessions,
  createSession,
  deleteSession
} = require('../controllers/liveSessionController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', protect, getCourseSessions);
router.post('/', protect, authorize('instructor', 'admin'), createSession);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSession);

module.exports = router;
