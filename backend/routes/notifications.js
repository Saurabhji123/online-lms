const express = require('express');
const {
  getNotifications,
  markAsRead,
  createNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id', protect, markAsRead);
router.post('/', protect, authorize('evaluator', 'admin'), createNotification);

module.exports = router;
