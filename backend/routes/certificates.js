const express = require('express');
const {
  getStudentCertificates,
  verifyCertificate
} = require('../controllers/certificateController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/me', protect, getStudentCertificates);
router.get('/verify/:certId', verifyCertificate);

module.exports = router;
