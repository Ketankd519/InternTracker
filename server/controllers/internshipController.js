// server/controllers/internshipController.js

const Internship = require('../models/Internship');
const Student = require('../models/Student');

/**
 * @desc    Apply / Register for an Internship
 * @route   POST /api/internships
 * @access  Private (Student)
 */
const applyInternship = async (req, res) => {
  try {
    // Find logged-in student's profile
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please complete your profile first.',
      });
    }

    // Check if internship already exists
    const existingInternship = await Internship.findOne({
      student: student._id,
    });

    if (existingInternship) {
      return res.status(400).json({
        success: false,
        message: 'An internship application already exists. Use the update endpoint instead.',
      });
    }

    const {
      companyName,
      managerName,
      managerId,
      managerEmail,
      managerPhone,
      internshipRole,
      startDate,
      endDate,
      totalWeeks,
    } = req.body;

    // Date Validation
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than start date.',
      });
    }

    // Total Weeks Validation
    if (totalWeeks < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total weeks must be greater than 0.',
      });
    }

    // Create Internship
    const internship = new Internship({
      student: student._id,
      companyName,
      managerName,
      managerId,
      managerEmail,
      managerPhone,
      internshipRole,
      startDate,
      endDate,
      totalWeeks,
      status: 'pending',
    });

    const savedInternship = await internship.save();

    res.status(201).json({
      success: true,
      message: 'Internship application submitted successfully',
      data: savedInternship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying for internship',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Internship Status
 * @route   GET /api/internships/status
 * @access  Private
 */
const getInternshipStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const internship = await Internship.findOne({
      student: student._id,
    })
      .populate('student')
      .populate('managerId', 'name email');

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'No internship record found for this student',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: internship.status,
        internship,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching internship status',
      error: error.message,
    });
  }
};

/**
 * @desc    Update Internship Details
 * @route   PUT /api/internships
 * @access  Private (Student/Admin/Manager)
 */
const updateInternship = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const { startDate, endDate, totalWeeks } = req.body;

    // Date Validation
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than start date.',
      });
    }

    // Total Weeks Validation
    if (totalWeeks && totalWeeks < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total weeks must be greater than 0.',
      });
    }

    const updatedInternship = await Internship.findOneAndUpdate(
      { student: student._id },
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('student')
      .populate('managerId', 'name email');

    if (!updatedInternship) {
      return res.status(404).json({
        success: false,
        message: 'No internship record found to update',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Internship details updated successfully',
      data: updatedInternship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating internship details',
      error: error.message,
    });
  }
};

module.exports = {
  applyInternship,
  getInternshipStatus,
  updateInternship,
};