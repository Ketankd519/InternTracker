const express = require('express');
const router = express.Router();

const {
  applyInternship,
  getInternshipStatus,
  updateInternship,
} = require('../controllers/internshipController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   /api/internships
 */

// Student only
router.post('/', protect, authorize('student'), applyInternship);

// Student can view own internship
router.get('/status', protect, authorize('student'), getInternshipStatus);

// Student can update own internship
router.put('/', protect, authorize('student'), updateInternship);

module.exports = router;