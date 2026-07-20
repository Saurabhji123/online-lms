const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const vm = require('vm');

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const { courseId, title, duration, maxMarks, maxAttempts } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const quiz = await Quiz.create({
      courseId,
      title,
      duration,
      maxMarks,
      maxAttempts: maxAttempts || 1
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getCourseQuizzes = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ studentId: req.user.id, courseId });
      if (!enrolled) {
        return res.status(403).json({ success: false, error: 'Not enrolled in this course' });
      }
    }

    const quizzes = await Quiz.find({ courseId }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add questions to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private (Instructor/Admin)
exports.addQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const question = await Question.create({
      quizId: quiz._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get quiz details (questions without correct answers for students)
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizDetails = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    let questions;
    if (req.user.role === 'student') {
      // Exclude correct answers
      questions = await Question.find({ quizId: quiz._id }).select('-correctAnswer');
    } else {
      questions = await Question.find({ quizId: quiz._id });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz,
        questions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Submit a quiz attempt (Auto Grading MCQ/True-False/FillBlank)
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    // Verify student is enrolled
    const enrolled = await Enrollment.findOne({ studentId: req.user.id, courseId: quiz.courseId });
    if (!enrolled) {
      return res.status(403).json({ success: false, error: 'Not enrolled in this course' });
    }

    // Check attempt limits
    const pastAttempts = await Result.countDocuments({ quizId: quiz._id, studentId: req.user.id });
    if (pastAttempts >= quiz.maxAttempts) {
      return res.status(400).json({ success: false, error: `You have reached the maximum attempt limit of ${quiz.maxAttempts}` });
    }

    const studentAnswers = req.body.answers; // Expecting array of { questionId, studentAnswer }
    const questions = await Question.find({ quizId: quiz._id });

    let score = 0;
    const gradedAnswers = [];

    questions.forEach((q) => {
      const match = studentAnswers.find(sa => sa.questionId === q._id.toString());
      const studentAns = match ? match.studentAnswer.toString().trim().toLowerCase() : '';
      const correctAns = q.correctAnswer.toString().trim().toLowerCase();

      let isCorrect = false;
      if (studentAns === correctAns) {
        isCorrect = true;
        score += q.marks;
      }

      gradedAnswers.push({
        questionId: q._id,
        studentAnswer: match ? match.studentAnswer : '',
        isCorrect
      });
    });

    const result = await Result.create({
      quizId: quiz._id,
      studentId: req.user.id,
      score,
      answers: gradedAnswers,
      attemptNumber: pastAttempts + 1
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
exports.getQuizResults = async (req, res, next) => {
  try {
    const results = await Result.find({ quizId: req.params.id })
      .populate('studentId', 'name email')
      .sort('-completedAt');

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Run online coding assessment compiler (Javascript/Node support + others mock)
// @route   POST /api/quizzes/coding/execute
// @access  Private (Student)
exports.executeCodingAssessment = async (req, res, next) => {
  try {
    const { code, language, problemName } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: 'Please provide code and language' });
    }

    // Set up test cases based on the problem
    let testCases = [];
    if (problemName === 'Reverse A String') {
      testCases = [
        { input: 'hello', expected: 'olleh' },
        { input: 'world', expected: 'dlrow' },
        { input: 'antigravity', expected: 'ytivargitna' },
        { input: 'LMS', expected: 'SML' },
        { input: 'a', expected: 'a' }
      ];
    } else {
      // Default fallback problem: Sum of Two Numbers
      testCases = [
        { input: [2, 3], expected: 5 },
        { input: [10, -5], expected: 5 },
        { input: [0, 0], expected: 0 }
      ];
    }

    const results = [];
    let passedCount = 0;

    if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
      // Run JS inside sandbox VM
      testCases.forEach((test, idx) => {
        try {
          const sandbox = {};
          vm.createContext(sandbox);
          // Evaluate standard code and append function caller
          let runScript;
          if (problemName === 'Reverse A String') {
            runScript = `${code}\nreverseString("${test.input}");`;
          } else {
            runScript = `${code}\nsum(${test.input[0]}, ${test.input[1]});`;
          }

          const output = vm.runInContext(runScript, sandbox, { timeout: 1000 });
          const passed = output === test.expected;
          if (passed) passedCount++;

          results.push({
            testCase: idx + 1,
            input: test.input,
            expected: test.expected,
            actual: output,
            passed
          });
        } catch (execErr) {
          results.push({
            testCase: idx + 1,
            input: test.input,
            expected: test.expected,
            actual: execErr.message,
            passed: false
          });
        }
      });
    } else {
      // Mock other languages (Java, Python, C++, C) by simulating execution
      testCases.forEach((test, idx) => {
        // Simple random checker to simulate compiler compiling
        const passed = Math.random() > 0.15; // 85% success simulation
        if (passed) passedCount++;

        results.push({
          testCase: idx + 1,
          input: test.input,
          expected: test.expected,
          actual: passed ? test.expected : 'Execution Timeout / Output Mismatch',
          passed
        });
      });
    }

    res.status(200).json({
      success: true,
      language,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
      allPassed: passedCount === testCases.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
