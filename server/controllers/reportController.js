const WeeklyReport = require('../models/WeeklyReport');
const Student = require('../models/Student');

/**
 * @desc    Submit a weekly report
 * @route   POST /api/reports
 * @access  Private (Student)
 */
const submitReport = async (req, res) => {
  try {
    // 1. Find logged-in student profile
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please complete profile setup first.',
      });
    }

    const { weekNumber, taskTitle, description, attachment } = req.body;

    // 2. Prevent duplicate report submission for the same week
    const existingReport = await WeeklyReport.findOne({
      student: student._id,
      weekNumber,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: `Report for Week ${weekNumber} has already been submitted.`,
      });
    }

    // 3. Create report entry
    const report = new WeeklyReport({
      student: student._id,
      weekNumber,
      taskTitle,
      description,
      attachment: req.file ? req.file.path : attachment, // File upload support
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: `Weekly report for Week ${weekNumber} submitted successfully`,
      data: savedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting weekly report',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all submitted reports with total count
 * @route   GET /api/reports or GET /api/reports/student/:student
 * @access  Private (Student / Teacher / Manager)
 */
const getStudentReports = async (req, res) => {
  try {
    let student = req.params.student;

    // If no student passed in params, fetch for current logged-in student
    if (!student) {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }
      student = student._id;
    }

    // Fetch reports sorted by week number ascending
    const reports = await WeeklyReport.find({ student }).sort({ weekNumber: 1 });

    // Count total reports submitted
    const totalReportsCount = await WeeklyReport.countDocuments({ student });

    res.status(200).json({
      success: true,
      totalSubmittedReports: totalReportsCount,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly reports',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify a weekly report (Manager / Admin approval)
 * @route   PUT /api/reports/:id/verify
 * @access  Private (Manager / Teacher)
 */
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerVerified } = req.body;

    const updatedReport = await WeeklyReport.findByIdAndUpdate(
      id,
      {
        $set: {
          managerVerified: managerVerified !== undefined ? managerVerified : true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Weekly report not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Weekly report verification status updated',
      data: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying weekly report',
      error: error.message,
    });
  }
};

module.exports = {
  submitReport,
  getStudentReports,
  verifyReport,
};