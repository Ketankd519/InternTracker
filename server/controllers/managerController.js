const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");

// MANAGER DASHBOARD
// GET /api/manager/dashboard
const getManagerDashboard = async (req, res) => {
  try {
    // Current logged-in manager
    const manager = await User.findById(req.user._id)
      .select("name email role");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // TOTAL STUDENTS
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    // ACTIVE STUDENTS
    // pending + ongoing + completed
    // rejected is excluded
    const activeInternships = await Internship.find({
      status: {
        $in: ["pending", "ongoing", "completed"],
      },
    }).select("student");

    const activeStudentIds = [
      ...new Set(
        activeInternships
          .filter((item) => item.student)
          .map((item) => item.student.toString())
      ),
    ];

    const activeStudents = activeStudentIds.length;

    // COMPLETED STUDENTS
    const completedInternships = await Internship.find({
      status: "completed",
    }).select("student");

    const completedStudentIds = [
      ...new Set(
        completedInternships
          .filter((item) => item.student)
          .map((item) => item.student.toString())
      ),
    ];

    const completedStudents = completedStudentIds.length;

    // WEEKLY REPORT COUNTS
    const pendingWeeklyReports =
      await WeeklyReport.countDocuments({
        status: "Pending",
      });

    const approvedWeeklyReports =
      await WeeklyReport.countDocuments({
        status: "Approved",
      });

    const rejectedWeeklyReports =
      await WeeklyReport.countDocuments({
        status: "Rejected",
      });

    const totalWeeklyReports =
      await WeeklyReport.countDocuments();

    res.status(200).json({
      success: true,

      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },

      statistics: {
        totalStudents,
        activeStudents,
        completedStudents,
        totalWeeklyReports,
        pendingWeeklyReports,
        approvedWeeklyReports,
        rejectedWeeklyReports,
      },
    });

  } catch (error) {
    console.error("Manager Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load manager dashboard",
      error: error.message,
    });
  }
};

// GET ALL STUDENTS FOR MANAGER APPROVAL
// GET /api/manager/students
const getManagerStudents = async (req, res) => {
  try {

    const studentUsers = await User.find({
      role: "student",
    }).select("-password");

    const students = [];
    for (const user of studentUsers) {

      // Student
      const student = await Student.findOne({
        user: user._id,
      });

      // Internship
      const internship = student
        ? await Internship.findOne({
            student: student._id,
          })
        : null;

      // Weekly Reports
      const weeklyReports = student
        ? await WeeklyReport.find({
            student: student._id,
          }).select("weekNumber")
        : [];

      let currentWeek = 0;

      if (weeklyReports.length > 0) {

        currentWeek = Math.max(
          ...weeklyReports.map(
            (report) => report.weekNumber || 0
          )
        );
      }

      students.push({
        userId: user._id,
        studentId: student
          ? student._id
          : null,

        name: user.name,
        email: user.email,
        rollNo: student
          ? student.rollNo || ""
          : "",

        companyName: internship
          ? internship.companyName
          : "Not Assigned",

        currentWeek,
        totalWeeks: internship
          ? internship.totalWeeks || 0
          : 0,

        internshipStatus: internship
          ? internship.status
          : "not-found",

        managerVerified: internship
          ? internship.managerVerified || false
          : false,
      });
    }

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });

  } catch (error) {
    console.error("Manager Students Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// VIEW STUDENT DETAILS
// Weekly Reports intentionally NOT returned.
// GET /api/manager/students/:studentId
const getManagerStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student
    const student = await Student.findById(
      studentId
    ).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // User
    const user = await User.findById(
      student.user
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Internship
    const internship =
      await Internship.findOne({
        student: student._id,
      }).lean();

    // Response
    // NO weeklyReports here
    res.status(200).json({
      success: true,

      student: {
        user,
        student,
        internship,
      },
    });

  } catch (error) {
    console.error(
      "Manager Student Details Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
      error: error.message,
    });
  }
};

// MANAGER VERIFY STUDENT INTERNSHIP
// PUT /api/manager/students/:studentId/verify
const verifyStudentByManager = async (req, res) => {
  try {
    const { studentId } = req.params;

    const internship =
      await Internship.findOne({
        student: studentId,
      });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found for this student",
      });
    }

    internship.managerVerified = true;
    await internship.save();
    res.status(200).json({
      success: true,
      message:
        "Student internship verified successfully",

      internship: {
        id: internship._id,
        managerVerified:
          internship.managerVerified,
      },
    });

  } catch (error) {
    console.error(
      "Manager Verification Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to verify student internship",
      error: error.message,
    });
  }
};

// GET WEEKLY REPORTS FOR EVALUATION
// GET /api/manager/evaluation
const getManagerEvaluationReports = async (
  req,
  res
) => {

  try {
    const reports =
      await WeeklyReport.find()
        .populate({
          path: "student",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    const evaluationData = reports.map(
      (report, index) => {
        const student = report.student;
        const user = student
          ? student.user
          : null;

        return {
          srNo: index + 1,
          reportId: report._id,
          studentId: student
            ? student._id
            : null,

          rollNo: student
            ? student.rollNo || ""
            : "",

          studentName: user
            ? user.name
            : "Unknown Student",

          submissionDate: report.submissionDate || report.createdAt,
          weekNumber: report.weekNumber || 0,
          taskTitle: report.taskTitle || "",
          description: report.description || "",
          attachment: report.attachment || "",
          managerVerified: report.managerVerified || false,
          status: report.status || "Pending",
          rejectionRemark: report.rejectionRemark || "",
        };
      }
    );

    res.status(200).json({
      success: true,
      count: evaluationData.length,
      reports: evaluationData,
    });

  } catch (error) {

    console.error(
      "Manager Evaluation Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly reports",
      error: error.message,
    });
  }
};

// APPROVE WEEKLY REPORT
// PUT /api/manager/reports/:reportId/approve
const approveWeeklyReport = async (req,res) => {
  try {
    const { reportId } = req.params;
    const report =
      await WeeklyReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Weekly report not found",
      });
    }

    report.status = "Approved";
    report.managerVerified = true;
    report.rejectionRemark = "";

    await report.save();

    res.status(200).json({
      success: true,
      message: "Weekly report approved successfully",
      report: {
        id: report._id,
        status: report.status,
        managerVerified: report.managerVerified,
      },
    });

  } catch (error) {
    console.error(
      "Approve Weekly Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to approve weekly report",
      error: error.message,
    });
  }
};

// REJECT WEEKLY REPORT
// PUT /api/manager/reports/:reportId/reject
const rejectWeeklyReport = async (req,res) => {
  try {
    const { reportId } = req.params;
    const { rejectionRemark } = req.body;

    // Remark required
    if (
      !rejectionRemark ||
      !rejectionRemark.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:"Rejection remark is required",
      });
    }

    const report =
      await WeeklyReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message:"Weekly report not found",
      });
    }

    report.status = "Rejected";
    report.managerVerified = false;
    report.rejectionRemark =
      rejectionRemark.trim();

    await report.save();

    res.status(200).json({
      success: true,
      message:"Weekly report rejected successfully",
      report: {
        id: report._id,
        status: report.status,
        managerVerified: report.managerVerified,
        rejectionRemark: report.rejectionRemark,
      },
    });
  } catch (error) {
    console.error(
      "Reject Weekly Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:"Failed to reject weekly report",
      error: error.message,
    });
  }
};

module.exports = {
  getManagerDashboard,
  getManagerStudents,
  getManagerStudentDetails,
  verifyStudentByManager,
  getManagerEvaluationReports,
  approveWeeklyReport,
  rejectWeeklyReport,
};