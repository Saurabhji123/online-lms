const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// @desc    Send/Broadcast a notification
// @route   POST /api/notifications
// @access  Private (Instructor/Admin)
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, target, courseId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please enter a message' });
    }

    let targetStudentIds = [];

    if (target === 'course' && courseId) {
      const enrollments = await Enrollment.find({ courseId });
      targetStudentIds = enrollments.map(e => e.studentId);
    } else {
      const students = await User.find({ role: 'student' });
      targetStudentIds = students.map(s => s._id);
    }

    if (targetStudentIds.length > 0) {
      const dbNotifications = targetStudentIds.map(studentId => ({
        userId: studentId,
        type: type || 'Announcement',
        message: `${title ? title + ': ' : ''}${message}`
      }));
      await Notification.insertMany(dbNotifications);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('newNotification', {
        title: title || 'System Update',
        message,
        type: type || 'Announcement',
        courseId
      });
    }

    res.status(201).json({
      success: true,
      data: { count: targetStudentIds.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    await notification.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark ALL notifications as read for current user
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
