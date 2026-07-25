const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

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

    // Create notifications for enrolled students
    const enrollments = await Enrollment.find({ courseId });
    const targetStudentIds = enrollments.map(e => e.studentId);
    if (targetStudentIds.length > 0) {
      const dbNotifications = targetStudentIds.map(studentId => ({
        userId: studentId,
        type: 'Lecture',
        message: `New Live Lecture scheduled: ${title}`
      }));
      await Notification.insertMany(dbNotifications);
    }

    // Broadcast Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('newNotification', {
        title: 'New Live Class Scheduled',
        message: `A live class "${title}" has been scheduled. Date: ${new Date(date).toLocaleString()}`,
        type: 'Lecture',
        courseId
      });
    }

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a live session
// @route   DELETE /api/livesessions/:id
// @access  Private (Instructor/Admin)
exports.deleteSession = async (req, res, next) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const course = await Course.findById(session.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await session.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all live sessions
// @route   GET /api/livesessions
// @access  Private
exports.getAllSessions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'evaluator') {
      const courses = await Course.find({ instructor: req.user.id });
      const courseIds = courses.map(c => c._id);
      query = { courseId: { $in: courseIds } };
    } else if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ studentId: req.user.id });
      const courseIds = enrollments.map(e => e.courseId);
      query = { courseId: { $in: courseIds } };
    }

    const sessions = await LiveSession.find(query).sort('date');
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
