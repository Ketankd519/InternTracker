const Student = require("../models/Student");
const User = require("../models/User");

// Create Student Profile
// POST /api/students/profile
// Private - Student
const createStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find logged-in user
    const user = await User.findById(userId).select(
      "name email role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check existing student profile
    const existingProfile = await Student.findOne({
      user: userId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message:"Student profile already exists. Use update instead.",
      });
    }

    const {
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
      teacherName,
      cgpa,
    } = req.body;

    // Create Student
    const studentProfile = new Student({
      user: userId,

      // Name comes from USERS collection
      fullName: user.name,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      profilePhoto: req.file
        ? `profile/${req.file.filename}`
        : null,

      college,
      department,
      semester,
      rollNo,
      enrollmentNumber,
      teacherId,
      teacherName,
      cgpa,
      profileCompleted: true,
      // Teacher verification starts as false
      teacherVerified: false,
    });

    const savedProfile =
      await studentProfile.save();

    // Populate user information
    await savedProfile.populate(
      "user",
      "name email role"
    );

    // await savedProfile.populate(
    //   "teacherId",
    //   "name email"
    // );

    return res.status(201).json({
      success: true,
      profileExists: true,
      message:
        "Student profile created successfully.",
      data: savedProfile,
    });
  } catch (error) {
    console.error(
      "Create Student Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error creating student profile",
      error: error.message,
    });
  }
};

// Get Logged-in Student Profile
// GET /api/students/profile
// Private - Student
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // ALWAYS get user information
    const user = await User.findById(userId).select(
      "name email role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Find student profile
    const profile = await Student.findOne({
      user: userId,
    })
      .populate("user", "name email role")
      // .populate("teacherId", "name email");

    // NEW USER
    // No Student document yet
    if (!profile) {
      return res.status(200).json({
        success: true,
        profileExists: false,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    // EXISTING STUDENT
    return res.status(200).json({
      success: true,
      profileExists: true,
      data: profile,
    });
  } catch (error) {
    console.error(
      "Get Student Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:"Error fetching student profile",
      error: error.message,
    });
  }
};

// Update Student Profile
// PUT /api/students/profile
// Private - Student
const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find existing profile
    let profile = await Student.findOne({
      user: userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:"Student profile not found. Please create one first.",
      });
    }

    // File upload
    if (req.file) {
      req.body.profilePhoto =
        req.file.path;
    }

    // Never allow frontend to change these
    delete req.body.user;
    delete req.body.fullName;
    delete req.body.profileCompleted;
    delete req.body.teacherVerified;

// Normalize teacherId
if (Array.isArray(req.body.teacherId)) {
  req.body.teacherId = req.body.teacherId[0] || "";
}

if (
  req.body.teacherId === undefined ||
  req.body.teacherId === ""
) {
  delete req.body.teacherId;
}

// Normalize teacherName
if (Array.isArray(req.body.teacherName)) {
  req.body.teacherName = req.body.teacherName[0] || "";
}

if (
  req.body.teacherName === undefined ||
  req.body.teacherName === ""
) {
  delete req.body.teacherName;
}

    // Update profile
    profile =
      await Student.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            ...req.body,
            profileCompleted: true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "name email role"
        )

    return res.status(200).json({
      success: true,
      profileExists: true,
      message:
        "Student profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    console.error(
      "Update Student Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error updating student profile",
      error: error.message,
    });
  }
};

module.exports = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
};