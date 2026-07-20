const express = require('express');
const {
  getCourseSessions,
  createSession
} = require('../controllers/liveSessionController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', protect, getCourseSessions);
router.post('/', protect, authorize('instructor', 'admin'), createSession);

module.exports = router;
