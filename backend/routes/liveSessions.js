const express = require('express');
const {
  getCourseSessions,
  createSession,
  deleteSession,
  getAllSessions
} = require('../controllers/liveSessionController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllSessions);
router.get('/course/:courseId', protect, getCourseSessions);
router.post('/', protect, authorize('evaluator', 'admin'), createSession);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteSession);

module.exports = router;
