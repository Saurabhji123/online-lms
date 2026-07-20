const Result = require('../models/Result');

// @desc    Get student's own quiz results
// @route   GET /api/results/me
// @access  Private (Student)
exports.getStudentResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('quizId', 'title courseId')
      .sort('-completedAt');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get student's attempt results for a specific quiz
// @route   GET /api/results/quiz/:quizId
// @access  Private
exports.getQuizResultDetails = async (req, res, next) => {
  try {
    const results = await Result.find({
      studentId: req.user.id,
      quizId: req.params.quizId
    }).sort('-completedAt');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
