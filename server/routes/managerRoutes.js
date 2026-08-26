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
  getManagerProfile,
  createManagerProfile,
  updateManagerProfile,
  getAllManagers,
  deleteManagerWarning,
} = require("../controllers/managerController");

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { managerSignatureUpload} = require("../middleware/uploadMiddleware");

// MANAGER PROFILE
router.get("/profile",protect,authorize("manager"),getManagerProfile);
router.post("/profile",protect,authorize("manager"),managerSignatureUpload.single("signature"),
  createManagerProfile
);
router.put("/profile",protect,authorize("manager"),managerSignatureUpload.single("signature"),
  updateManagerProfile
);

// GET ALL MANAGERS
// GET /api/manager/all
router.get("/all",protect,authorize("student"),getAllManagers);

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

// Add this route:
// DISMISS WARNING
// DELETE /api/manager/warnings/:warningId
router.delete("/warnings/:warningId",protect,authorize("manager"),deleteManagerWarning);

module.exports = router;