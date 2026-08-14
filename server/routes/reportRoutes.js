const express = require('express');
const router = express.Router();

const {
  submitReport,
  getStudentReports,
  verifyReport,
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { reportUpload } = require('../middleware/uploadMiddleware');

/**
 * @route   /api/reports
 */

// Student submits weekly report
router.post('/',protect,authorize('student'),reportUpload.single('attachment'),submitReport);

// Student views own reports
router.get('/',protect,authorize('student'),getStudentReports);

// Teacher / Manager / Admin view any student's reports
router.get('/student/:studentId', protect,authorize('teacher', 'manager', 'admin'),
  getStudentReports
);

// Teacher / Manager verifies report
router.put('/:id/verify',protect,authorize('teacher', 'manager', 'admin'),
  verifyReport
);

module.exports = router;