const express = require('express');
const {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verifyemail', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.put('/profile', protect, upload.single('photo'), updateProfile);

module.exports = router;
