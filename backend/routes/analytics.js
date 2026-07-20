const express = require('express');
const { getDashboardAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardAnalytics);

module.exports = router;
