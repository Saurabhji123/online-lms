const express = require('express');
const {
  getStudentResults,
  getQuizResultDetails
} = require('../controllers/resultController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/me', protect, getStudentResults);
router.get('/quiz/:quizId', protect, getQuizResultDetails);

module.exports = router;
