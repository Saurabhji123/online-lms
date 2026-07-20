const Discussion = require('../models/Discussion');
const Course = require('../models/Course');

// @desc    Get discussions for a course
// @route   GET /api/discussions/course/:courseId
// @access  Private
exports.getDiscussions = async (req, res, next) => {
  try {
    const discussions = await Discussion.find({ courseId: req.params.courseId })
      .populate('user', 'name photo role')
      .populate('answers.user', 'name photo role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: discussions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a new discussion question
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res, next) => {
  try {
    const { courseId, question } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const discussion = await Discussion.create({
      courseId,
      user: req.user.id,
      question
    });

    // Populate user info for immediate display on frontend
    const populated = await Discussion.findById(discussion._id).populate('user', 'name photo role');

    // Socket.IO hook for real-time notification can be called here if needed

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add reply to a discussion
// @route   POST /api/discussions/:id/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion thread not found' });
    }

    discussion.answers.push({
      user: req.user.id,
      replyText
    });

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('user', 'name photo role')
      .populate('answers.user', 'name photo role');

    res.status(201).json({
      success: true,
      data: updatedDiscussion
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Like a reply
// @route   PUT /api/discussions/:id/replies/:replyId/like
// @access  Private
exports.likeReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    const reply = discussion.answers.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    // Toggle like
    const likeIndex = reply.likedBy.indexOf(req.user.id);
    if (likeIndex > -1) {
      reply.likedBy.splice(likeIndex, 1);
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      reply.likedBy.push(req.user.id);
      reply.likes += 1;
    }

    await discussion.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark a reply as the best answer
// @route   PUT /api/discussions/:id/replies/:replyId/best
// @access  Private
exports.markBestReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    // Check permissions (only course instructor or thread author can mark best)
    const course = await Course.findById(discussion.courseId);
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAuthor = discussion.user.toString() === req.user.id;

    if (!isInstructor && !isAuthor && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to select the best answer' });
    }

    // Toggle best answer flag
    discussion.answers.forEach((ans) => {
      if (ans._id.toString() === req.params.replyId) {
        ans.isBest = !ans.isBest;
      } else {
        ans.isBest = false; // Only one best reply is allowed
      }
    });

    await discussion.save();

    res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
