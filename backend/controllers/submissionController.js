const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

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
