const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Get dashboard analytics depending on role
// @route   GET /api/analytics
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const role = req.user.role;
    const analytics = { role };

    if (role === 'student') {
      // Fetch student stats
      const enrollmentsCount = await Enrollment.countDocuments({ studentId: req.user.id });
      const certificatesCount = await Certificate.countDocuments({ studentId: req.user.id });
      
      const enrollments = await Enrollment.find({ studentId: req.user.id });
      const totalProgress = enrollments.reduce((acc, curr) => acc + curr.progress, 0);
      const avgProgress = enrollmentsCount > 0 ? Math.round(totalProgress / enrollmentsCount) : 0;

      analytics.stats = {
        coursesEnrolled: enrollmentsCount,
        certificatesEarned: certificatesCount,
        averageProgress: avgProgress,
        hoursLearned: Math.round(enrollmentsCount * 8.5) // Simulated learning hours
      };
    } else if (role === 'instructor') {
      // Fetch instructor courses
      const instructorCourses = await Course.find({ instructor: req.user.id });
      const courseIds = instructorCourses.map(c => c._id);
      
      const coursesCount = instructorCourses.length;
      const studentsCount = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
      const certificatesCount = await Certificate.countDocuments({ courseId: { $in: courseIds } });

      // Simulated revenue ($15 per enrollment)
      const revenue = studentsCount * 15;

      analytics.stats = {
        coursesCreated: coursesCount,
        totalStudents: studentsCount,
        certificatesIssued: certificatesCount,
        revenue: revenue
      };
    } else if (role === 'admin') {
      // Platform wide stats
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalInstructors = await User.countDocuments({ role: 'instructor' });
      const totalCourses = await Course.countDocuments({});
      const totalCertificates = await Certificate.countDocuments({});

      analytics.stats = {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalCertificates
      };
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
