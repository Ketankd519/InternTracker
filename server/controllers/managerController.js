const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");
const Manager = require("../models/Manager");

// MANAGER DASHBOARD
// GET /api/manager/dashboard
const getManagerDashboard = async (req, res) => {
  try {

    // CURRENT LOGGED-IN MANAGER
    const manager = await User.findById(req.user._id)
      .select("name email role");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // GET MANAGER PROFILE
    const managerProfile = await Manager.findOne({
      user: req.user._id,
    })
      .select("managerId warnings")
      .lean();

    if (!managerProfile) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    // TOTAL STUDENTS
    // ALL STUDENTS ON PORTAL
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    // ACTIVE STUDENTS
    // ALL STUDENTS ON PORTAL
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
    // ALL STUDENTS ON PORTAL
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

    // INTERNSHIPS ASSIGNED TO CURRENT MANAGER
    const managerInternships = await Internship.find({
      managerId: managerProfile.managerId,
    }).select("student status");

    // Get student IDs assigned to this manager
    const managerStudentIds = [
      ...new Set(
        managerInternships
          .filter((item) => item.student)
          .map((item) => item.student.toString())
      ),
    ];

    // ASSIGNED STUDENTS COUNT
    const assignedStudents = managerStudentIds.length;

    // COMPLETED ASSIGNED STUDENTS
    const completedAssignedStudents =
      managerInternships.filter(
        (item) =>
          item.student &&
          item.status === "completed"
      ).length;

    // WEEKLY REPORTS OF CURRENT MANAGER'S
    // STUDENTS ONLY
    const reportFilter = {
      student: {
        $in: managerStudentIds,
      },
    };

    // TOTAL WEEKLY REPORTS
    const totalWeeklyReports =
      await WeeklyReport.countDocuments(
        reportFilter
      );

    // PENDING WEEKLY REPORTS
    const pendingWeeklyReports =
      await WeeklyReport.countDocuments({
        ...reportFilter,
        status: "Pending",
      });

    // APPROVED WEEKLY REPORTS
    const approvedWeeklyReports =
      await WeeklyReport.countDocuments({
        ...reportFilter,
        status: "Approved",
      });

    // REJECTED WEEKLY REPORTS
    const rejectedWeeklyReports =
      await WeeklyReport.countDocuments({
        ...reportFilter,
        status: "Rejected",
      });

    // RESPONSE
    res.status(200).json({
      success: true,

      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        managerId: managerProfile.managerId,
        warnings: managerProfile.warnings || [],
      },

      statistics: {
        // Existing portal-wide statistics
        totalStudents,
        activeStudents,
        completedStudents,

        // Current manager statistics
        assignedStudents,
        completedAssignedStudents,

        // Current manager's weekly reports only
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

// MANAGER DISMISS / DELETE WARNING
// DELETE /api/manager/warnings/:warningId
const deleteManagerWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    const manager = await Manager.findOne({ user: req.user._id });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    manager.warnings = manager.warnings.filter(
      (w) => w._id.toString() !== warningId
    );

    await manager.save();

    res.status(200).json({
      success: true,
      message: "Warning dismissed successfully",
      warnings: manager.warnings,
    });
  } catch (error) {
    console.error("Delete Manager Warning Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dismiss warning",
      error: error.message,
    });
  }
};

// GET STUDENTS ASSIGNED TO LOGGED-IN MANAGER
// GET /api/manager/students
const getManagerStudents = async (req, res) => {
  try {

    // GET LOGGED-IN MANAGER
    const manager = await Manager.findOne({
      user: req.user._id,
    }).lean();

    // Manager profile not found
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    // GET INTERNSHIPS ASSIGNED TO THIS MANAGER
    const internships = await Internship.find({
      managerId: manager.managerId,
    }).lean();

    const students = [];

    // GET STUDENT DATA FOR EACH INTERNSHIP
    for (const internship of internships) {

      // Find Student connected to this internship
      const student = await Student.findById(
        internship.student
      ).lean();

      // Skip if student profile does not exist
      if (!student) {
        continue;
      }

      // Find User connected to this student
      const user = await User.findById(
        student.user
      )
        .select("-password")
        .lean();

      // Skip if user account does not exist
      if (!user) {
        continue;
      }

      // WEEKLY REPORTS
      const weeklyReports =
        await WeeklyReport.find({
          student: student._id,
        })
          .select("weekNumber")
          .lean();

      // CURRENT WEEK
      let currentWeek = 0;

      if (weeklyReports.length > 0) {

        currentWeek = Math.max(
          ...weeklyReports.map(
            (report) => report.weekNumber || 0
          )
        );
      }

      // ADD STUDENT
      students.push({
        userId: user._id,
        studentId: student._id,
        name: user.name,
        email: user.email,
        rollNo: student.rollNo || "",
        companyName: internship.companyName || "Not Assigned",
        currentWeek,
        totalWeeks: internship.totalWeeks || 0,
        internshipStatus: internship.status || "not-found",
        teacherVerified: student.teacherVerified || false,
        managerVerified: internship.managerVerified || false,
      });
    }

    // RESPONSE
    res.status(200).json({
      success: true,

      // Useful for checking which manager
      // is currently being used
      managerId: manager.managerId,
      count: students.length,
      students,
    });

  } catch (error) {

    console.error("Manager Students Error:",error);

    res.status(500).json({
      success: false,
      message:"Failed to fetch students",
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
    const user = await User.findById(student.user)
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
    console.error("Manager Student Details Error:",error);

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

    const internship = await Internship.findOne({
        student: studentId,
      });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found for this student",
      });
    }

    internship.managerVerified = true;
    internship.status = "ongoing";
    await internship.save();
    res.status(200).json({
      success: true,
      message:"Student internship verified successfully",

      internship: {
        id: internship._id,
        managerVerified: internship.managerVerified,
        status: internship.status,
      },
    });

  } catch (error) {
    console.error("Manager Verification Error:",error);

    res.status(500).json({
      success: false,
      message: "Failed to verify student internship",
      error: error.message,
    });
  }
};

// GET WEEKLY REPORTS FOR EVALUATION
// GET /api/manager/evaluation
const getManagerEvaluationReports = async (req, res) => {
  try {

    // GET LOGGED-IN MANAGER
    const manager = await Manager.findOne({
      user: req.user._id,
    }).lean();

    // Manager profile not found
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    // GET INTERNSHIPS ASSIGNED TO THIS MANAGER
    const internships = await Internship.find({
      managerId: manager.managerId,
    })
      .select("student")
      .lean();

    // Get only student IDs assigned to this manager
    const studentIds = internships
      .filter((internship) => internship.student)
      .map((internship) => internship.student);

    // NO STUDENTS ASSIGNED
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        reports: [],
      });
    }

    // GET WEEKLY REPORTS ONLY FOR THIS MANAGER'S STUDENTS
    const reports = await WeeklyReport.find({
      student: {
        $in: studentIds,
      },
    })
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

    // FORMAT EVALUATION DATA
    const evaluationData = reports.map((report, index) => {
      const student = report.student;
      const user = student ? student.user : null;
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
    });

    // RESPONSE
    res.status(200).json({
      success: true,

      // Useful for debugging
      managerId: manager.managerId,
      count: evaluationData.length,
      reports: evaluationData,
    });

  } catch (error) {
    console.error("Manager Evaluation Error:",error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly reports",
      error: error.message,
    });
  }
};

// APPROVE WEEKLY REPORT
// PUT /api/manager/reports/:reportId/approve
const approveWeeklyReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // GET LOGGED-IN MANAGER
    const manager = await Manager.findOne({
      user: req.user._id,
    }).lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    // FIND WEEKLY REPORT
    const report = await WeeklyReport.findById(
      reportId
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Weekly report not found",
      });
    }

    // CHECK WHETHER THIS STUDENT BELONGS TO THIS MANAGER
    const internship = await Internship.findOne({
      student: report.student,
      managerId: manager.managerId,
    });

    // Report does not belong to logged-in manager
    if (!internship) {
      return res.status(403).json({
        success: false,
        message:"You are not authorized to approve this weekly report.",
      });
    }

    // APPROVE REPORT
    report.status = "Approved";
    report.managerVerified = true;
    report.rejectionRemark = "";
    await report.save();

    // RESPONSE
    res.status(200).json({
      success: true,

      message:"Weekly report approved successfully",

      report: {
        id: report._id,
        status: report.status,
        managerVerified:
          report.managerVerified,
      },
    });

  } catch (error) {
    console.error("Approve Weekly Report Error:",error);

    res.status(500).json({
      success: false,
      message:"Failed to approve weekly report",
      error: error.message,
    });
  }
};

// REJECT WEEKLY REPORT
// PUT /api/manager/reports/:reportId/reject
const rejectWeeklyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { rejectionRemark } = req.body;

    // REMARK REQUIRED
    if (
      !rejectionRemark ||
      !rejectionRemark.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:"Rejection remark is required",
      });
    }

    // GET LOGGED-IN MANAGER
    const manager = await Manager.findOne({
      user: req.user._id,
    }).lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message:"Manager profile not found",
      });
    }

    // FIND WEEKLY REPORT
    const report = await WeeklyReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message:"Weekly report not found",
      });
    }

    // CHECK WHETHER THIS STUDENT BELONGS TO THIS MANAGER
    const internship = await Internship.findOne({
        student: report.student,
        managerId: manager.managerId,
      });

    // Report does not belong to logged-in manager
    if (!internship) {
      return res.status(403).json({
        success: false,
        message:"You are not authorized to reject this weekly report.",
      });
    }

    // REJECT REPORT
    report.status = "Rejected";
    report.managerVerified = false;
    report.rejectionRemark = rejectionRemark.trim();
    
    await report.save();

    // RESPONSE
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
    console.error("Reject Weekly Report Error:",error);

    res.status(500).json({
      success: false,
      message:"Failed to reject weekly report",
      error: error.message,
    });
  }
};

// GET MANAGER PROFILE
// GET /api/manager/profile
const getManagerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name email role")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Manager account not found",
      });
    }

    const manager = await Manager.findOne({
      user: req.user._id,
    }).lean();

    res.status(200).json({
      success: true,
      profileExists: !!manager,
      user,
      manager: manager || null,
    });
  } catch (error) {
    console.error("Get Manager Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch manager profile",
      error: error.message,
    });
  }
};

// CREATE MANAGER PROFILE
// POST /api/manager/profile
const createManagerProfile = async (req, res) => {
  try {
    const {
      mobileNo,
      experience,
      companyName,
    } = req.body;

    const user = await User.findById(req.user._id).select("name email");
    
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Teacher account not found",
        });
      }

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const existingManager = await Manager.findOne({
      user: req.user._id,
    });

    if (existingManager) {
      return res.status(400).json({
        success: false,
        message: "Manager profile already exists",
      });
    }

    const currentYear = new Date()
      .getFullYear()
      .toString()
      .slice(-2);

    // First alphabet of company
    const companyCode = companyName
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 1)
      .toUpperCase();

    if (!companyCode) {
      return res.status(400).json({
        success: false,
        message: "Company name must contain at least one letter",
      });
    }

    const prefix = `M${currentYear}`;
    const lastManager = await Manager.findOne({
      managerId: {
        $regex: `^${prefix}\\d{3}${companyCode}$`,
      },
    })
      .sort({ managerId: -1 })
      .lean();

    let sequence = 1;

    if (lastManager) {
      const sequencePart = lastManager.managerId.substring(
        prefix.length,
        prefix.length + 3
      );
      sequence = Number(sequencePart) + 1;
    }

    const sequenceNumber = String(sequence).padStart(3, "0");
    const managerId =`M${currentYear}${sequenceNumber}${companyCode}`;

    const manager = await Manager.create({
      user: req.user._id,
      name: user.name,
      email: user.email,
      managerId,
      mobileNo: mobileNo?.trim() || "",
      experience:
        experience !== undefined && experience !== null
          ? String(experience).trim()
          : "",
      companyName: companyName.trim(),
        signature: req.file
          ? `manager-signatures/${req.file.filename}`
          : "",
    });

    res.status(201).json({
      success: true,
      message: "Manager profile saved successfully.",
      manager,
    });
  } catch (error) {
    console.error("Create Manager Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:"Manager ID already exists. Please try saving the profile again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save manager profile",
      error: error.message,
    });
  }
};

// UPDATE MANAGER PROFILE
// PUT /api/manager/profile
const updateManagerProfile = async (req, res) => {
  try {
    const {
      mobileNo,
      experience,
      companyName,
    } = req.body;

    const manager = await Manager.findOne({
      user: req.user._id,
    });

    const user = await User.findById(req.user._id).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found",
      });
    }

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // managerId is intentionally NOT changed.
    manager.name = user.name;
    manager.email = user.email;
    manager.mobileNo = mobileNo?.trim() || "";
    manager.experience =
      experience !== undefined && experience !== null
        ? String(experience).trim()
        : "";
    manager.companyName = companyName.trim();

    if (req.file) {
      manager.signature = `manager-signatures/${req.file.filename}`;
    }

    await manager.save();

    res.status(200).json({
      success: true,
      message: "Manager profile updated successfully.",
      manager,
    });
  } catch (error) {
    console.error("Update Manager Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update manager profile",
      error: error.message,
    });
  }
};

// GET ALL MANAGERS FOR STUDENT INTERNSHIP
// GET /api/manager/all
const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find({})
      .select("managerId name email mobileNo companyName")
      .sort({ managerId: 1 })
      .lean();

    res.status(200).json({
      success: true,
      managers,
    });
  } catch (error) {
    console.error("Get All Managers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch managers",
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
  getManagerProfile,
  createManagerProfile,
  updateManagerProfile,
  getAllManagers,
  deleteManagerWarning,
};