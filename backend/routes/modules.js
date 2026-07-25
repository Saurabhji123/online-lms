const express = require('express');
const {
  createModule,
  updateModule,
  deleteModule
} = require('../controllers/moduleController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('evaluator', 'admin'), createModule);
router.put('/:id', protect, authorize('evaluator', 'admin'), updateModule);
router.delete('/:id', protect, authorize('evaluator', 'admin'), deleteModule);

module.exports = router;
