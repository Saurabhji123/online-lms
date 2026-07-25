const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('evaluator', 'admin'), upload.single('thumbnail'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('evaluator', 'admin'), upload.single('thumbnail'), updateCourse)
  .delete(protect, authorize('evaluator', 'admin'), deleteCourse);

module.exports = router;
