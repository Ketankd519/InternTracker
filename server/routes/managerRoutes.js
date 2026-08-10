const express = require("express");
const router = express.Router();

// Controllers
const {
  getManagerDashboard,
  getManagerStudents,
  getManagerStudentDetails,
  verifyStudentByManager,
  getManagerEvaluationReports,
  approveWeeklyReport,
  rejectWeeklyReport,
} = require("../controllers/managerController");

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// DASHBOARD
router.get("/dashboard",protect,authorize("manager"),getManagerDashboard);

// APPROVALS - STUDENTS
router.get("/students",protect,authorize("manager"),getManagerStudents);

// VIEW STUDENT
router.get("/students/:studentId",protect,authorize("manager"),getManagerStudentDetails);

// VERIFY STUDENT INTERNSHIP
router.put("/students/:studentId/verify",protect,authorize("manager"),verifyStudentByManager);

// EVALUATION - WEEKLY REPORTS
router.get("/evaluation",protect,authorize("manager"),getManagerEvaluationReports);

// APPROVE WEEKLY REPORT
router.put("/reports/:reportId/approve",protect,authorize("manager"),approveWeeklyReport);

// REJECT WEEKLY REPORT
router.put("/reports/:reportId/reject",protect,authorize("manager"),rejectWeeklyReport);

module.exports = router;