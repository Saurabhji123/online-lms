const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lms_deepmind_antigravity_secret_key_2026_jwt_token_auth', {
    expiresIn: '30d'
  });
};

module.exports = { generateToken };
