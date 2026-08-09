const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");

// ==========================================
// Get Student Dashboard
// GET /api/student-dashboard
// Private - Student
// ==========================================
const getStudentDashboard = async (req, res) => {
  try {
    // --------------------------------------
    // 1. Get logged-in user
    // --------------------------------------
    const user = await User.findById(req.user._id).select(
      "name email role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------
    // 2. Get student profile
    // --------------------------------------
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student profile not found. Please complete your profile first.",
      });
    }

    // --------------------------------------
    // 3. Get internship
    // --------------------------------------
    const internship = await Internship.findOne({
      student: student._id,
    });

    // --------------------------------------
    // 4. Get weekly report counts
    // --------------------------------------
    const submittedReports = await WeeklyReport.countDocuments({
      student: student._id,
    });

    const approvedReports = await WeeklyReport.countDocuments({
      student: student._id,
      status: "Approved",
    });

    const rejectedReports = await WeeklyReport.countDocuments({
      student: student._id,
      status: "Rejected",
    });

    const pendingReports = await WeeklyReport.countDocuments({
      student: student._id,
      status: "Pending",
    });

    // --------------------------------------
    // 5. Total weeks
    // --------------------------------------
    const totalWeeks = internship
      ? internship.totalWeeks
      : 0;

    // --------------------------------------
    // 6. Calculate completion
    // --------------------------------------
    const completion =
      totalWeeks > 0
        ? Math.min(
            Math.round((submittedReports / totalWeeks) * 100),
            100
          )
        : 0;

    // --------------------------------------
    // 7. Internship status
    // --------------------------------------
    const internshipStatus = internship
      ? internship.status
      : null;

    // --------------------------------------
    // 8. Verification status
    // --------------------------------------
    const teacherVerified = student.teacherVerified || false;
    const managerVerified = student.managerVerified || false;

    let verificationStatus = "NOT VERIFIED";

    if (teacherVerified && managerVerified) {
      verificationStatus = "VERIFIED";
    } else if (teacherVerified || managerVerified) {
      verificationStatus = "PARTIALLY VERIFIED";
    }

    // --------------------------------------
    // 9. Send dashboard data
    // --------------------------------------
    return res.status(200).json({
      success: true,

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        internship: {
          status: internshipStatus,
          totalWeeks: totalWeeks,
        },

        reports: {
          submitted: submittedReports,
          pending: pendingReports,
          approved: approvedReports,
          rejected: rejectedReports,
        },

        completion,

        verification: {
          teacherVerified,
          managerVerified,
          status: verificationStatus,
        },
      },
    });
  } catch (error) {
    console.error("Student Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching student dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentDashboard,
};