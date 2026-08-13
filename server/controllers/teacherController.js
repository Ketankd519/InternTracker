const User = require("../models/User");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");

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
    // distinct student IDs are counted
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

    res.status(200).json({
      success: true,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      },
      statistics: {
        totalStudents,
        activeStudents,
        completedStudents,
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

// GET ALL STUDENTS
// GET /api/teacher/students
const getTeacherStudents = async (req, res) => {
  try {
    // Get all student users
    const studentUsers = await User.find({
      role: "student",
    }).select("-password");

    const students = [];

    for (const user of studentUsers) {
      // Find Student document connected to this user
      const student = await Student.findOne({
        user: user._id,
      });

      // Find internship
      const internship = await Internship.findOne({
        student: student ? student._id : null,
      });

      // Get all weekly reports for this student
      const weeklyReports = student
        ? await WeeklyReport.find({
            student: student._id,
          }).select("weekNumber")
        : [];

      // CURRENT WEEK
      // Largest weekNumber
      let currentWeek = 0;

      if (weeklyReports.length > 0) {
        currentWeek = Math.max(
          ...weeklyReports.map((report) => report.weekNumber || 0)
        );
      }

      students.push({
        userId: user._id,
        studentId: student ? student._id : null,
        name: user.name,
        email: user.email,
        companyName: internship ? internship.companyName : "Not Assigned",
        currentWeek,
        totalWeeks: internship ? internship.totalWeeks : 0,
        internshipStatus: internship
          ? internship.status
          : "not-found",

        teacherVerified: student
          ? student.teacherVerified || false
          : false,
      });
    }

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get Teacher Students Error:", error);

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
      console.log("Student not found");

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log(
      "Updated Student:",
      student._id.toString()
    );

    console.log(
      "teacherVerified:",
      student.teacherVerified
    );

    return res.status(200).json({
      success: true,
      message: "Student verified successfully",

      student: {
        id: student._id,
        teacherVerified: student.teacherVerified,
      },
    });

  } catch (error) {
    console.error(
      "Teacher Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify student",
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherStudentDetails,
  verifyStudentByTeacher,
};