const WeeklyReport = require("../models/WeeklyReport");
const Student = require("../models/Student");
const Internship = require("../models/Internship");

// Submit Weekly Report
// POST /api/reports
// Private - Student
const submitReport = async (req, res) => {
  try {
    // Find logged-in student's profile
    const student = await Student.findOne({
      user: req.user._id,
    });

    const {
      weekNumber,
      taskTitle,
      description,
      submissionDate,
    } = req.body;

    // Validate required fields
    if (
      !weekNumber ||
      !taskTitle ||
      !description ||
      !submissionDate
    ) {
      return res.status(400).json({
        success: false,
        message:"Week number, task title, description and submission date are required.",
      });
    }

  // Find student's internship
  const internship = await Internship.findOne({
    student: student._id,
  });

  if (!internship) {
    return res.status(404).json({
      success: false,
      message: "Internship record not found. Please complete your internship application first.",
    });
  }

  // Validate week number against total internship weeks
  if (Number(weekNumber) > internship.totalWeeks) {
    return res.status(400).json({
      success: false,
      message: `Invalid week number. Your internship is for ${internship.totalWeeks} weeks. You cannot submit a report for Week ${weekNumber}.`,
    });
  }

    // Check duplicate week
    const existingReport = await WeeklyReport.findOne({
      student: student._id,
      weekNumber: Number(weekNumber),
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message:`Report for Week ${weekNumber} has already been submitted.`,
      });
    }

    // Create report
    const report = new WeeklyReport({
      student: student._id,
      weekNumber: Number(weekNumber),
      taskTitle,
      description,
      submissionDate,
      attachment: req.file
        ? `uploads/reports/${req.file.filename}`
        : null,

      // Always Pending when student submits
      status: "Pending",
      managerVerified: false,
    });

    const savedReport = await report.save();
    return res.status(201).json({
      success: true,
      message: `Weekly report for Week ${weekNumber} submitted successfully.`,
      data: savedReport,
    });

  } catch (error) {
    console.error("Submit Weekly Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error submitting weekly report",
      error: error.message,
    });
  }
};

// Get Student Reports
// GET /api/reports
// Private - Student
const getStudentReports = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    // If studentId is not provided,
    // get logged-in student's profile
    if (!studentId) {
      const student = await Student.findOne({
        user: req.user._id,
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }
      studentId = student._id;
    }

    // Fetch reports
    const reports = await WeeklyReport.find({
      student: studentId,
    })
      .sort({
        weekNumber: 1,
      })
      .lean();

    reports.forEach((report) => {
      if (report.attachment) {
        // Convert old Windows filesystem path to web path
        if (report.attachment.includes("\\") || report.attachment.includes(":")) {
          const filename = report.attachment.split(/[\\/]/).pop();
          report.attachment = `uploads/reports/${filename}`;
        }
      }
    });

    // Count reports
    const totalReportsCount =
      await WeeklyReport.countDocuments({
        student: studentId,
      });

    return res.status(200).json({
      success: true,
      totalSubmittedReports: totalReportsCount,
      data: reports,
    });

  } catch (error) {
    console.error("Get Weekly Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching weekly reports",
      error: error.message,
    });
  }
};

// Verify Weekly Report
// PUT /api/reports/:id/verify
// Private - Teacher / Manager / Admin
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      managerVerified,
      rejectionRemark,
    } = req.body;

    // Determine Verification
    const isVerified =
      managerVerified !== undefined
        ? managerVerified
        : true;

    // Determine Status
    const status = isVerified
      ? "Approved"
      : "Rejected";

    // Rejection Remark
    const remark =
      isVerified === false
        ? rejectionRemark || ""
        : "";

    // Update Report
    const updatedReport =
      await WeeklyReport.findByIdAndUpdate(
        id,
        {
          $set: {
            managerVerified: isVerified,
            status: status,
            rejectionRemark: remark,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // Report Not Found
    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Weekly report not found",
      });
    }

    // Response
    return res.status(200).json({
      success: true,
      message:
        isVerified === false
          ? "Weekly report rejected successfully"
          : "Weekly report approved successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error(
      "Verify Weekly Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:"Error verifying weekly report",
      error: error.message,
    });
  }
};

// Update Rejected Weekly Report
// PUT /api/reports/:id
// Private - Student
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find logged-in student's profile
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find report
    const report = await WeeklyReport.findOne({
      _id: id,
      student: student._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Weekly report not found",
      });
    }

    // Only rejected reports can be edited
    if (report.status !== "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Only rejected reports can be edited.",
      });
    }

    const {
      taskTitle,
      description,
      submissionDate,
    } = req.body;

    // Validate required fields
    if (!taskTitle || !description || !submissionDate) {
      return res.status(400).json({
        success: false,
        message:
          "Task title, description and submission date are required.",
      });
    }

    // Find student's internship
    const internship = await Internship.findOne({
      student: student._id,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship record not found.",
      });
    }

    // IMPORTANT:
    // weekNumber is intentionally NOT taken from req.body.
    // Therefore student cannot change the week number.

    // Update editable fields
    report.taskTitle = taskTitle;
    report.description = description;
    report.submissionDate = submissionDate;

    // Update attachment only if a new file was uploaded
    if (req.file) {
      report.attachment = `uploads/reports/${req.file.filename}`;
    }

    // Reset verification after student correction
    report.status = "Pending";
    report.managerVerified = false;

    // Clear old rejection remark
    report.rejectionRemark = "";

    const updatedReport = await report.save();

    return res.status(200).json({
      success: true,
      message:
        `Weekly report for Week ${report.weekNumber} updated successfully and sent for manager approval.`,
      data: updatedReport,
    });

  } catch (error) {
    console.error("Update Weekly Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating weekly report",
      error: error.message,
    });
  }
};

module.exports = {
  submitReport,
  getStudentReports,
  verifyReport,
  updateReport,
};