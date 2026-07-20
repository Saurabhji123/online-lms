const express = require('express');
const {
  getStudentAttendance,
  markAttendanceManual
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', protect, getStudentAttendance);
router.post('/', protect, authorize('instructor', 'admin'), markAttendanceManual);

module.exports = router;
