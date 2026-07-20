const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const generateCertificatePDF = require('../utils/certificateGenerator');
const Attendance = require('../models/Attendance');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId, paymentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    // Mock payment verification if paymentId is provided (Paid Course Enrollment simulator)
    if (paymentId) {
      console.log(`Razorpay transaction ${paymentId} verified for Course ${courseId}`);
    }

    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId,
      status: 'active',
      progress: 0
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user enrolled courses
// @route   GET /api/enrollments
// @access  Private (Student)
exports.getEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id }).populate({
      path: 'courseId',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get enrollment details / status for a specific course
// @route   GET /api/enrollments/course/:courseId
// @access  Private
exports.getEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (!enrollment) {
      return res.status(200).json({ success: true, enrolled: false });
    }

    res.status(200).json({
      success: true,
      enrolled: true,
      data: enrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update video watch progress & mark lecture as completed
// @route   POST /api/enrollments/course/:courseId/lecture/:lectureId
// @access  Private (Student)
exports.updateLectureProgress = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;

    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment record not found' });
    }

    // Add to completed lectures if not already there
    if (!enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
      
      // Mark attendance automatically for this student based on lecture completion
      await Attendance.create({
        studentId: req.user.id,
        courseId,
        source: 'LectureCompletion',
        status: 'Present'
      });
    }

    // Calculate total lectures in the course
    const modules = await Module.find({ courseId });
    const moduleIds = modules.map(m => m._id);
    const totalLectures = await Lecture.countDocuments({ moduleId: { $in: moduleIds } });

    // Calculate progress percentage
    if (totalLectures > 0) {
      enrollment.progress = Math.round((enrollment.completedLectures.length / totalLectures) * 100);
    } else {
      enrollment.progress = 0;
    }

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();

    // Check certificate eligibility
    let certificate = null;
    if (enrollment.status === 'completed') {
      const existingCert = await Certificate.findOne({
        studentId: req.user.id,
        courseId
      });

      if (!existingCert) {
        // Fetch course and student names
        const course = await Course.findById(courseId);
        const certificateId = `CERT-${courseId.toString().substring(0,4).toUpperCase()}-${req.user.id.toString().substring(0,4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        const issueDate = new Date().toLocaleDateString();

        // Generate PDF
        const fileUrl = await generateCertificatePDF(
          req.user.name,
          course.title,
          certificateId,
          issueDate
        );

        // Save Certificate record
        certificate = await Certificate.create({
          studentId: req.user.id,
          courseId,
          certificateId,
          fileUrl
        });
      } else {
        certificate = existingCert;
      }
    }

    res.status(200).json({
      success: true,
      progress: enrollment.progress,
      status: enrollment.status,
      certificate
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get enrolled students for a course
// @route   GET /api/enrollments/course/:courseId/students
// @access  Private (Instructor/Admin)
exports.getEnrolledStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email phone photo');

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
