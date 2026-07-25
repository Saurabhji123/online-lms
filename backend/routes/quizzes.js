const express = require('express');
const {
  createQuiz,
  getCourseQuizzes,
  addQuestion,
  getQuizDetails,
  submitQuiz,
  getQuizResults,
  executeCodingAssessment,
  deleteQuiz
} = require('../controllers/quizController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('evaluator', 'admin'), createQuiz);
router.get('/course/:courseId', protect, getCourseQuizzes);
router.post('/:id/questions', protect, authorize('evaluator', 'admin'), addQuestion);
router.get('/:id', protect, getQuizDetails);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/:id/results', protect, authorize('evaluator', 'admin'), getQuizResults);
router.post('/coding/execute', protect, authorize('student'), executeCodingAssessment);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteQuiz);

module.exports = router;
