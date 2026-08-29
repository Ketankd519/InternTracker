const express = require("express");
const router = express.Router();

// Middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Certificates
const { getAllCertificates } = require("../controllers/adminCertificateController");

// 1. Dashboard Controller
const { getDashboardStats } = require("../controllers/adminController");

// 2. Student Management Controllers
const {
  getAllStudents,
  getStudentProfile,
  rejectInternship,
  deleteStudent,
} = require("../controllers/adminStudentController");

// 3. Teacher Management Controllers
const {
  getAllTeachers,
  getTeacherProfile,
  issueWarning: issueTeacherWarning,
  deleteWarning: deleteTeacherWarning,
  deleteTeacher,
} = require("../controllers/adminTeacherController");

// 4. Manager Management Controllers
const {
  getAllManagers,
  getManagerProfile,
  issueWarning: issueManagerWarning,
  deleteWarning: deleteManagerWarning,
  deleteManager,
} = require("../controllers/adminManagerController");

// =========================================
// APPLY GLOBAL AUTH & ROLE MIDDLEWARE
// =========================================
router.use(protect, adminOnly);

// =========================================
// DASHBOARD
// =========================================
router.get("/dashboard", getDashboardStats);

// =========================================
// STUDENT MANAGEMENT
// =========================================
router.get("/students", getAllStudents);
router.get("/students/:id", getStudentProfile);
router.put("/students/:id/reject", rejectInternship);
router.delete("/students/:id", deleteStudent);

// =========================================
// TEACHER MANAGEMENT
// =========================================
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherProfile);
router.post("/teachers/:id/warning", issueTeacherWarning);
router.delete("/teachers/:id/warning/:warningId", deleteTeacherWarning);
router.delete("/teachers/:id", deleteTeacher);

// =========================================
// MANAGER MANAGEMENT
// =========================================
router.get("/managers", getAllManagers);
router.get("/managers/:id", getManagerProfile);
router.post("/managers/:id/warning", issueManagerWarning);
router.delete("/managers/:id/warning/:warningId", deleteManagerWarning);
router.delete("/managers/:id", deleteManager);

// Add this route in adminRoutes.js:
router.get("/certificates", protect, adminOnly, getAllCertificates);
module.exports = router;