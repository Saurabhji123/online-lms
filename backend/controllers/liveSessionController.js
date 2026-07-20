const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');

// @desc    Get live sessions for a course
// @route   GET /api/livesessions/course/:courseId
// @access  Private
exports.getCourseSessions = async (req, res, next) => {
  try {
    const sessions = await LiveSession.find({ courseId: req.params.courseId }).sort('date');
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a live session
// @route   POST /api/livesessions
// @access  Private (Instructor/Admin)
exports.createSession = async (req, res, next) => {
  try {
    const { courseId, title, date, duration } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Auto-generate Jitsi meeting URL
    const jitsiRoomName = `edulearn-${courseId}-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const meetingLink = `https://meet.jit.si/${jitsiRoomName}`;

    const session = await LiveSession.create({
      courseId,
      title,
      date,
      duration,
      meetingLink
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
