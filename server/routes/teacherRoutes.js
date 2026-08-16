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
} = require("../controllers/teacherController");

// Authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Role-based access middleware
const { authorize } = require("../middleware/roleMiddleware");

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
  createTeacherProfile
);

router.put(
  "/profile",
  protect,
  authorize("teacher"),
  updateTeacherProfile
);

// TEACHER DASHBOARD
// GET /api/teacher/dashboard
router.get("/dashboard",protect,authorize("teacher"),getTeacherDashboard);

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