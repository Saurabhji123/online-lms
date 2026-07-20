const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// @desc    Get student attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const filter = { courseId: req.params.courseId };
    
    // Students only see their own attendance
    if (req.user.role === 'student') {
      filter.studentId = req.user.id;
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Manually mark attendance (Instructor/Admin)
// @route   POST /api/attendance
// @access  Private (Instructor/Admin)
exports.markAttendanceManual = async (req, res, next) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const attendance = await Attendance.create({
      studentId,
      courseId,
      date: date || new Date(),
      status: status || 'Present',
      source: 'Manual'
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
