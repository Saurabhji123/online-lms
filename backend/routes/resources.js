const express = require('express');
const {
  getCourseResources,
  createResource
} = require('../controllers/resourceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/course/:courseId', protect, getCourseResources);
router.post('/', protect, authorize('instructor', 'admin'), upload.single('file'), createResource);

module.exports = router;
