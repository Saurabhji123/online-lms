const express = require('express');
const {
  createLecture,
  updateLecture,
  deleteLecture
} = require('../controllers/lectureController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('evaluator', 'admin'), upload.single('video'), createLecture);
router.put('/:id', protect, authorize('evaluator', 'admin'), upload.single('video'), updateLecture);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteLecture);

module.exports = router;
