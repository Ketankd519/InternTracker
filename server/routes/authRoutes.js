const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Example role-protected route testing
router.get('/teacher-only', protect, authorize('teacher', 'admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Teacher/Admin' });
});

module.exports = router;