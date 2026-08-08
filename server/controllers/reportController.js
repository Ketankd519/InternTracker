const WeeklyReport = require("../models/WeeklyReport");
const Student = require("../models/Student");

// ==========================================
// Submit Weekly Report
// POST /api/reports
// Private - Student
// ==========================================
const submitReport = async (req, res) => {
  try {
    // Find logged-in student's profile
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
        message:
          "Week number, task title, description and submission date are required.",
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
        message:
          `Report for Week ${weekNumber} has already been submitted.`,
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
        ? req.file.path
        : null,

      // Always Pending when student submits
      status: "Pending",

      managerVerified: false,
    });

    const savedReport = await report.save();

    return res.status(201).json({
      success: true,
      message:
        `Weekly report for Week ${weekNumber} submitted successfully.`,
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


// ==========================================
// Get Student Reports
// GET /api/reports
// Private - Student
// ==========================================
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
    }).sort({
      weekNumber: 1,
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


// ==========================================
// Verify Weekly Report
// PUT /api/reports/:id/verify
// Private - Teacher / Manager / Admin
// ==========================================
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerVerified } = req.body;

    const updatedReport =
      await WeeklyReport.findByIdAndUpdate(
        id,
        {
          $set: {
            managerVerified:
              managerVerified !== undefined
                ? managerVerified
                : true,

            status:
              managerVerified === false
                ? "Rejected"
                : "Approved",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Weekly report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Weekly report verification status updated",
      data: updatedReport,
    });

  } catch (error) {
    console.error("Verify Weekly Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Error verifying weekly report",
      error: error.message,
    });
  }
};


module.exports = {
  submitReport,
  getStudentReports,
  verifyReport,
};