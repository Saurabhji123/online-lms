const express = require('express');
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id', protect, markAsRead);

module.exports = router;
