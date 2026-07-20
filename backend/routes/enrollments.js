const express = require('express');
const {
  enrollInCourse,
  getEnrollments,
  getEnrollmentStatus,
  updateLectureProgress,
  getEnrolledStudents
} = require('../controllers/enrollmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('student'), enrollInCourse)
  .get(protect, authorize('student'), getEnrollments);

router.get('/course/:courseId', protect, getEnrollmentStatus);
router.get('/course/:courseId/students', protect, authorize('instructor', 'admin'), getEnrolledStudents);
router.post('/course/:courseId/lecture/:lectureId', protect, authorize('student'), updateLectureProgress);

module.exports = router;
