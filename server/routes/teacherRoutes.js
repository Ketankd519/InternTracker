const express = require("express");
const router = express.Router();

const {
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherStudentDetails,
  verifyStudentByTeacher,
  getTeacherProfile,
  createTeacherProfile,
  updateTeacherProfile,
  getTeachersByDepartment,
} = require("../controllers/teacherController");

// Authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Role-based access middleware
const { authorize } = require("../middleware/roleMiddleware");

const { signatureUpload } = require("../middleware/uploadMiddleware");

// TEACHER PROFILE
router.get(
  "/profile",
  protect,
  authorize("teacher"),
  getTeacherProfile
);

router.post(
  "/profile",
  protect,
  authorize("teacher"),
  signatureUpload.single("signature"),
  createTeacherProfile
);

router.put(
  "/profile",
  protect,
  authorize("teacher"),
  signatureUpload.single("signature"),
  updateTeacherProfile
);

// TEACHER DASHBOARD
// GET /api/teacher/dashboard
router.get("/dashboard",protect,authorize("teacher"),getTeacherDashboard);

// GET TEACHERS BY DEPARTMENT
// GET /api/teacher/list?department=CA
router.get("/list",protect,authorize("student"),getTeachersByDepartment);

// ALL STUDENTS
// GET /api/teacher/students
router.get("/students",protect,authorize("teacher"),getTeacherStudents);

// VIEW STUDENT
// GET /api/teacher/students/:studentId
router.get("/students/:studentId",protect,authorize("teacher"),getTeacherStudentDetails);

// VERIFY STUDENT
// PUT /api/teacher/students/:studentId/verify
router.put("/students/:studentId/verify",protect,authorize("teacher"),verifyStudentByTeacher);

module.exports = router;