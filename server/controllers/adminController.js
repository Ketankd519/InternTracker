const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Manager = require("../models/Manager");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      activeStudents,
      completedStudents,
      totalTeachers,
      activeTeachers,
      totalManagers,
      activeManagers,
      totalWeeklyReports,
      totalApproved,
      totalPending,
      totalRejected,

      // Internship Status
      ongoingInternships,
      completedInternships,
      pendingInternships,
      rejectedInternships,
    ] = await Promise.all([
      // User Statistics
      User.countDocuments(),

      User.countDocuments({ role: "student" }),

      Internship.countDocuments({ status: "pending" }),

      Internship.countDocuments({ status: "completed" }),

      User.countDocuments({ role: "teacher" }),

      Teacher.countDocuments(),

      User.countDocuments({ role: "manager" }),

      Manager.countDocuments(),

      // Weekly Report Statistics
      WeeklyReport.countDocuments(),

      WeeklyReport.countDocuments({ status: "Approved" }),

      WeeklyReport.countDocuments({ status: "Pending" }),

      WeeklyReport.countDocuments({ status: "Rejected" }),

      // Internship Status Statistics
      Internship.countDocuments({ status: "ongoing" }),

      Internship.countDocuments({ status: "completed" }),

      Internship.countDocuments({ status: "pending" }),

      Internship.countDocuments({ status: "rejected" }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        // Main Statistics
        totalUsers,
        totalStudents,
        activeStudents,
        completedStudents,
        totalTeachers,
        activeTeachers,
        totalManagers,
        activeManagers,
        totalWeeklyReports,
        totalApproved,
        totalPending,
        totalRejected,

        // Internship Status
        internshipStatus: {
          ongoing: ongoingInternships,
          completed: completedInternships,
          pending: pendingInternships,
          rejected: rejectedInternships,
        },
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard statistics",
    });
  }
};