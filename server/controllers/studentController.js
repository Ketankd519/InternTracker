const Student = require('../models/Student');

/**
 * @desc    Create Student Profile
 * @route   POST /api/students/profile
 * @access  Private (Student)
 */
const createStudentProfile = async (req, res) => {
  try {
    const user = req.user._id;

    // Check if student profile already exists for this user
    let existingProfile = await Student.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Student profile already exists. Use update instead.',
      });
    }

    const {
      fullName,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      profilePhoto,
      college,
      department,
      semester,
      rollNo,
      enrollmentNumber,
      teacherId,
      cgpa,
    } = req.body;

    // Create new profile
    const studentProfile = new Student({
      user,
      fullName,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      profilePhoto: req.file ? req.file.path : profilePhoto, // Handles optional file upload path or URL
      college,
      department,
      semester,
      rollNo,
      enrollmentNumber,
      teacherId,
      cgpa,
      profileCompleted: true,
    });

    const savedProfile = await studentProfile.save();

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      data: savedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating student profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Logged-in Student Profile
 * @route   GET /api/students/profile
 * @access  Private (Student/Teacher/Admin)
 */
const getStudentProfile = async (req, res) => {
  try {
    const user = req.user._id;

    // Find student profile and populate reference fields
    const profile = await Student.findOne({ user })
      .populate('user', 'name email role')
      .populate('teacherId', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Update Student Profile
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
const updateStudentProfile = async (req, res) => {
  try {
    const user = req.user._id;

    let profile = await Student.findOne({ user });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please create one first.',
      });
    }

    // Handle file upload if present
    if (req.file) {
      req.body.profilePhoto = req.file.path;
    }

    // Update profile fields
    profile = await Student.findOneAndUpdate(
      { user },
      { $set: { ...req.body, profileCompleted: true } },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email role')
      .populate('teacherId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message,
    });
  }
};

module.exports = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
};