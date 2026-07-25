const express = require('express');
const {
  getCourseResources,
  createResource,
  deleteResource
} = require('../controllers/resourceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/course/:courseId', protect, getCourseResources);
router.post('/', protect, authorize('evaluator', 'admin'), upload.single('file'), createResource);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteResource);

module.exports = router;
