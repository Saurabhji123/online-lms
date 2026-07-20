const express = require('express');
const {
  getContacts,
  getChatHistory,
  sendMessage
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/contacts', protect, getContacts);
router.get('/history/:contactId', protect, getChatHistory);
router.post('/', protect, sendMessage);

module.exports = router;
