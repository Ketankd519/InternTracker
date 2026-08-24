const express = require("express");
const router = express.Router();

const {getStudentDashboard} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// GET /api/student-dashboard
router.get("/",protect,authorize("student"),
  getStudentDashboard
);

module.exports = router;