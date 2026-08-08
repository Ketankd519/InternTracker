const express = require('express');
const router = express.Router();

// Import Student Controllers
const {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} = require('../controllers/studentController');

// Import Middleware
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   /api/students/profile
 * @desc    Create, Get and Update Student Profile
 * @access  Private (Student)
 */

router
  .route('/profile')
  .post(
    protect,
    authorize('student'),
    upload.single('profilePhoto'),
    createStudentProfile
  )
  .get(
    protect,
    authorize('student'),
    getStudentProfile
  )
  .put(
    protect,
    authorize('student'),
    upload.single('profilePhoto'),
    updateStudentProfile
  );

module.exports = router;