const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
// mark-all-read MUST be declared BEFORE /:id so Express doesn't treat it as an id
router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorize('evaluator', 'admin'), createNotification);

module.exports = router;
