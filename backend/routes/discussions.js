const express = require('express');
const {
  getDiscussions,
  createDiscussion,
  addReply,
  likeReply,
  markBestReply
} = require('../controllers/discussionController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/course/:courseId', protect, getDiscussions);
router.post('/', protect, createDiscussion);
router.post('/:id/replies', protect, addReply);
router.put('/:id/replies/:replyId/like', protect, likeReply);
router.put('/:id/replies/:replyId/best', protect, markBestReply);

module.exports = router;
