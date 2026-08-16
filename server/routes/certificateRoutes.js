const express = require("express");

const router = express.Router();

const {
  getMyCertificateStatus,
  getStudentCertificate,
  getCertificateStudentList,
  approveCertificateByTeacher,
  approveCertificateByManager,
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