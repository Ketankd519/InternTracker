const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");
const Teacher = require("../models/Teacher");

// TEACHER DASHBOARD
// GET /api/teacher/dashboard
const getTeacherDashboard = async (req, res) => {
  try {
    // Current logged-in teacher
    const teacher = await User.findById(req.user._id).select("name email role");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // GET TEACHER PROFILE
    // We need teacher.teacherId because Student collection
    // stores the teacher's unique teacherId, not MongoDB _id.
    const teacherProfile = await Teacher.findOne({
      user: req.user._id,
    }).select("teacherId warnings");

    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // TOTAL STUDENTS
    // User collection where role = student
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    // ACTIVE STUDENTS
    // Include students having internship status:
    // pending, ongoing, completed
    // Exclude:
    // rejected
    // no internship
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
    // Internship status = completed
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

    // STUDENTS ASSIGNED TO CURRENT TEACHER
    const assignedStudents = await Student.find({
      teacherId: teacherProfile.teacherId,
    }).select("_id");

    const assignedStudentIds = assignedStudents.map(
      (student) => student._id
    );

    const assignedStudentsCount = assignedStudentIds.length;

    // COMPLETED STUDENTS OF CURRENT TEACHER
    const completedAssignedStudents =
      await Internship.countDocuments({
        student: {
          $in: assignedStudentIds,
        },
        status: "completed",
      });

    res.status(200).json({
      success: true,

      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacherProfile.teacherId,
        warnings: teacherProfile.warnings || [],  
      },

      statistics: {
        totalStudents,
        activeStudents,
        completedStudents,

        // NEW
        assignedStudents: assignedStudentsCount,
        completedAssignedStudents,
      },
    });
  } catch (error) {
    console.error("Teacher Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load teacher dashboard",
      error: error.message,
    });
  }
};

// TEACHER DISMISS / DELETE WARNING
// DELETE /api/teacher/warnings/:warningId
const deleteTeacherWarning = async (req, res) => {
  try {
    const { warningId } = req.params;

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    teacher.warnings = teacher.warnings.filter(
      (w) => w._id.toString() !== warningId
    );

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Warning dismissed successfully",
      warnings: teacher.warnings,
    });
  } catch (error) {
    console.error("Delete Warning Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dismiss warning",
      error: error.message,
    });
  }
};

// GET STUDENTS ASSIGNED TO LOGGED-IN TEACHER
// GET /api/teacher/students
const getTeacherStudents = async (req, res) => {
  try {
    // Get the teacher profile of the currently logged-in teacher
    const teacher = await Teacher.findOne({
      user: req.user._id,
    }).lean();

    // Teacher profile not found
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Get only students who selected this teacher's teacherId
    const studentProfiles = await Student.find({
      teacherId: teacher.teacherId,
    }).lean();

    const students = [];

    for (const student of studentProfiles) {
      // Find User document connected to this student
      const user = await User.findById(student.user)
        .select("-password")
        .lean();

      // Skip if user account does not exist
      if (!user) {
        continue;
      }

      // Find internship
      const internship = await Internship.findOne({
        student: student._id,
      }).lean();

      // Get all weekly reports for this student
      const weeklyReports = await WeeklyReport.find({
        student: student._id,
      })
        .select("weekNumber")
        .lean();

      // CURRENT WEEK
      // Largest weekNumber
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
        studentId: student._id,
        name: user.name,
        email: user.email,
        companyName: internship
          ? internship.companyName
          : "Not Assigned",

        currentWeek,
        totalWeeks: internship
          ? internship.totalWeeks
          : 0,

        internshipStatus: internship
          ? internship.status
          : "not-found",

        managerVerified: internship
          ? internship.managerVerified || false
          : false,

        teacherVerified: student.teacherVerified || false,
      });
    }

    res.status(200).json({
      success: true,

      // Optional but useful for debugging
      teacherId: teacher.teacherId,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get Teacher Students Error:",error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// VIEW COMPLETE STUDENT PROFILE
// GET /api/teacher/students/:studentId
const getTeacherStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student
    const student = await Student.findById(studentId).lean();

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
    const internship = await Internship.findOne({
      student: student._id,
    }).lean();

    // Weekly Reports
    const weeklyReports = await WeeklyReport.find({
      student: student._id,
    })
      .sort({ weekNumber: 1 })
      .lean();

    // Current Week
    let currentWeek = 0;

    if (weeklyReports.length > 0) {
      currentWeek = Math.max(
        ...weeklyReports.map((report) => report.weekNumber || 0)
      );
    }

    res.status(200).json({
      success: true,

      student: {
        user,
        student,
        internship,
        weeklyReports,
        currentWeek,
      },
    });
  } catch (error) {
    console.error("Get Student Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
      error: error.message,
    });
  }
};

// TEACHER VERIFY STUDENT
// PUT /api/teacher/students/:studentId/verify
const verifyStudentByTeacher = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find and update student
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          teacherVerified: true,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id teacherVerified");

    // Student not found
    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student verified successfully",
      student: {
        id: student._id,
        teacherVerified: student.teacherVerified,
      },
    });

  } catch (error) {
    console.error("Teacher Verification Error:",error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify student",
      error: error.message,
    });
  }
};

// GET TEACHER PROFILE
// GET /api/teacher/profile
const getTeacherProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name email role")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found",
      });
    }

    const teacher = await Teacher.findOne({
      user: req.user._id,
    }).lean();

    res.status(200).json({
      success: true,
      profileExists: !!teacher,
      user,
      teacher: teacher || null,
    });
  } catch (error) {
    console.error("Get Teacher Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher profile",
      error: error.message,
    });
  }
};

// CREATE TEACHER PROFILE
// POST /api/teacher/profile
const createTeacherProfile = async (req, res) => {
  try {
    const {
      course,
      department,
      mobileNo,
      experience,
      collegeName,
    } = req.body;

    // Get teacher name from User collection
    const user = await User.findById(req.user._id).select("name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found",
      });
    }

    // Required validation
    if (!course || !course.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!collegeName || !collegeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    // Check existing profile
    const existingTeacher = await Teacher.findOne({
      user: req.user._id,
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile already exists",
      });
    }

    // Current year
    const currentYear = new Date()
      .getFullYear()
      .toString()
      .slice(-2);

    // Course first 2 characters
    const courseCode = course
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 2)
      .toUpperCase();

    // Department first 2 characters
    const departmentCode = department
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 2)
      .toUpperCase();

    if (courseCode.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Course must contain at least 2 letters",
      });
    }

    if (departmentCode.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Department must contain at least 2 letters",
      });
    }

    // Find next sequence for current year + course + department
    const prefix = `${courseCode}${currentYear}`;

    const lastTeacher = await Teacher.findOne({
      teacherId: {
        $regex: `^${prefix}\\d{3}${departmentCode}$`,
      },
    })
      .sort({ teacherId: -1 })
      .lean();

    let sequence = 1;

    if (lastTeacher) {
      const sequencePart = lastTeacher.teacherId.substring(
        prefix.length,
        prefix.length + 3
      );
      sequence = Number(sequencePart) + 1;
    }

    const sequenceNumber = String(sequence).padStart(3, "0");
    const teacherId = `${courseCode}${currentYear}${sequenceNumber}${departmentCode}`;

    const teacher = await Teacher.create({
      user: req.user._id,
      name: user.name,
      teacherId,
      course: course.trim(),
      department: department.trim(),
      mobileNo: mobileNo?.trim() || "",
      experience: experience?.trim() || "",
      collegeName: collegeName.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Teacher profile saved successfully.",
      teacher,
    });
  } catch (error) {
    console.error("Create Teacher Profile Error:", error);

    // Handles duplicate generated ID safely
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:"Teacher ID already exists. Please try saving the profile again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save teacher profile",
      error: error.message,
    });
  }
};

// UPDATE TEACHER PROFILE
// PUT /api/teacher/profile
const updateTeacherProfile = async (req, res) => {
  try {
    const {
      course,
      department,
      mobileNo,
      experience,
      collegeName,
    } = req.body;

    const teacher = await Teacher.findOne({
      user: req.user._id,
    });

    const user = await User.findById(req.user._id).select("name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found",
      });
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    if (!course || !course.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!collegeName || !collegeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    // IMPORTANT:
    // teacherId is NOT updated here.
    teacher.name = user.name;
    teacher.course = course.trim();
    teacher.department = department.trim();
    teacher.mobileNo = mobileNo?.trim() || "";
    teacher.experience = experience?.trim() || "";
    teacher.collegeName = collegeName.trim();
    if (req.file) {
    teacher.signature = `signatures/${req.file.filename}`;
    }
    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully.",
      teacher,
    });
  } catch (error) {
    console.error("Update Teacher Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update teacher profile",
      error: error.message,
    });
  }
};

// GET TEACHERS BY DEPARTMENT
// GET /api/teacher/list?department=CA
const getTeachersByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    const teachers = await Teacher.find({
      department: department.trim(),
    })
      .select("name teacherId mobileNo collegeName")
      .sort({ teacherId: 1 })
      .lean();

    res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error("Get Teachers By Department Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherStudentDetails,
  verifyStudentByTeacher,
  getTeacherProfile,
  createTeacherProfile,
  updateTeacherProfile,
  getTeachersByDepartment,
  deleteTeacherWarning,
};