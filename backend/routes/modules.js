const express = require('express');
const {
  createModule,
  updateModule,
  deleteModule
} = require('../controllers/moduleController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('instructor', 'admin'), createModule);
router.put('/:id', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteModule);

module.exports = router;
