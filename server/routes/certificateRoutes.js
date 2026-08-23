const express = require("express");

const router = express.Router();

const {
  getMyCertificateStatus,
  getStudentCertificate,
  getCertificateStudentList,
  approveCertificateByTeacher,
  approveCertificateByManager,
  verifyCertificate,
} = require("../controllers/certificateController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// ======================================================
// STUDENT
// Get own certificate status
// ======================================================

router.get(
  "/status",
  protect,
  authorize("student"),
  getMyCertificateStatus
);

// ======================================================
// TEACHER / MANAGER
// Get certificate student list
// ======================================================

router.get(
  "/students",
  protect,
  authorize("teacher", "manager"),
  getCertificateStudentList
);

// ======================================================
// TEACHER / MANAGER
// Get particular student's certificate
// ======================================================

router.get(
  "/student/:studentId",
  protect,
  authorize("teacher", "manager"),
  getStudentCertificate
);

// ======================================================
// PUBLIC CERTIFICATE VERIFICATION
// No login required
// GET /api/certificates/verify/:certificateId
// ======================================================

router.get(
  "/verify/:certificateId",
  verifyCertificate
);

// ======================================================
// TEACHER
// Approve certificate
// ======================================================

router.put(
  "/:studentId/teacher-approve",
  protect,
  authorize("teacher"),
  approveCertificateByTeacher
);

// ======================================================
// MANAGER
// Approve certificate
// ======================================================

router.put(
  "/:studentId/manager-approve",
  protect,
  authorize("manager"),
  approveCertificateByManager
);

module.exports = router;