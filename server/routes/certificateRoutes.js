const express = require('express');
const router = express.Router();

const {
  managerApprove,
  teacherApprove,
  generateCertificate,
  getCertificateStatus,
} = require('../controllers/certificateController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   /api/certificates
 */

// Manager approves certificate
router.put('/:studentId/manager-approve',protect,
  authorize('manager', 'admin'),
  managerApprove
);

// Teacher approves certificate
router.put('/:studentId/teacher-approve',protect,
  authorize('teacher', 'admin'),
  teacherApprove
);

// Generate certificate (only after both approvals)
router.post('/:studentId/generate',protect,
  authorize('teacher', 'manager', 'admin'),
  generateCertificate
);

// Get certificate status
// Student can use /me
router.get('/me',protect,
  authorize('student'),
  getCertificateStatus
);

// Teacher / Manager / Admin can view any student's certificate
router.get('/:studentId',protect,
  authorize('teacher', 'manager', 'admin'),
  getCertificateStatus
);

module.exports = router;