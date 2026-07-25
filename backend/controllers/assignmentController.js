const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

// @desc    Create a course assignment
// @route   POST /api/assignments
// @access  Private (Instructor/Admin)
exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, deadline, maxMarks } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const attachments = [];
    if (req.files) {
      req.files.forEach(file => {
        attachments.push(`/uploads/${file.filename}`);
      });
    } else if (req.file) {
      attachments.push(`/uploads/${req.file.filename}`);
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      deadline,
      maxMarks,
      attachments
    });

    // Create notifications for enrolled students
    const enrollments = await Enrollment.find({ courseId });
    const targetStudentIds = enrollments.map(e => e.studentId);
    if (targetStudentIds.length > 0) {
      const dbNotifications = targetStudentIds.map(studentId => ({
        userId: studentId,
        type: 'Assignment',
        message: `New Assignment published: ${title}`
      }));
      await Notification.insertMany(dbNotifications);
    }

    // Broadcast Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('newNotification', {
        title: 'New Assignment',
        message: `An assignment "${title}" has been published. Deadline: ${new Date(deadline).toLocaleDateString()}`,
        type: 'Assignment',
        courseId
      });
    }

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getCourseAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check enrollment if user is student
    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ studentId: req.user.id, courseId });
      if (!enrolled) {
        return res.status(403).json({ success: false, error: 'Not enrolled in this course' });
      }
    }

    const assignments = await Assignment.find({ courseId }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, textSubmission } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    // Verify student is enrolled
    const enrolled = await Enrollment.findOne({ studentId: req.user.id, courseId: assignment.courseId });
    if (!enrolled) {
      return res.status(403).json({ success: false, error: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already submitted this assignment' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      textSubmission,
      fileUrl,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Instructor/Admin)
exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Evaluate a submission
// @route   PUT /api/submissions/:id/evaluate
// @access  Private (Instructor/Admin)
exports.evaluateSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;

    let submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    const course = await Course.findById(assignment.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (marks > assignment.maxMarks) {
      return res.status(400).json({ success: false, error: `Marks cannot exceed maximum marks (${assignment.maxMarks})` });
    }

    submission.marks = marks;
    submission.feedback = feedback || '';
    submission.status = 'evaluated';
    await submission.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Instructor/Admin)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const course = await Course.findById(assignment.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Delete associated submissions
    await Submission.deleteMany({ assignmentId: req.params.id });

    await assignment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAllAssignments = async (req, res, next) => {
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

    const assignments = await Assignment.find(query).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
