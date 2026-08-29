const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Certificate = require("../models/Certificate");

// @desc    Get all teachers with assigned, verified, approved student counts
// @route   GET /api/admin/teachers
// @access  Admin
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("user", "name email role")
      .lean();

    const teacherList = await Promise.all(
      teachers.map(async (teacher) => {
        // Find all students assigned to this teacher (by teacherId string or Teacher _id)
        const assignedStudents = await Student.find({
          $or: [
            { teacherId: teacher.teacherId },
            { teacherId: teacher._id.toString() },
          ],
        }).lean();

        const totalAssigned = assignedStudents.length;

        // Total students verified by this teacher
        const totalVerified = assignedStudents.filter(
          (std) => std.teacherVerified === true
        ).length;

        // Total students approved by this teacher in certificates collection
        const studentIds = assignedStudents.map((std) => std._id);
        const totalApproved = await Certificate.countDocuments({
          studentId: { $in: studentIds },
          teacherApproved: true,
        });

        return {
          _id: teacher._id,
          teacherName: teacher.name || teacher.user?.name || "N/A",
          teacherId: teacher.teacherId || "N/A",
          collegeName: teacher.collegeName || "N/A",
          department: teacher.department || "N/A",
          totalAssignedStudents: totalAssigned,
          totalVerifiedStudents: totalVerified,
          totalApprovedStudents: totalApproved,
          warningCount: teacher.warnings ? teacher.warnings.length : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: teacherList,
    });
  } catch (error) {
    console.error("Error fetching admin teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers list",
    });
  }
};

// @desc    Get complete teacher profile, assigned students & warning history
// @route   GET /api/admin/teachers/:id
// @access  Admin
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("user", "name email role isDeleted deletionReason deletedAt")
      .lean();

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Fetch assigned students
    const assignedStudents = await Student.find({
      $or: [
        { teacherId: teacher.teacherId },
        { teacherId: teacher._id.toString() },
      ],
    })
      .populate("user", "name email")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        teacher,
        assignedStudents,
        warnings: teacher.warnings || [],
      },
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher profile",
    });
  }
};

// @desc    Issue a warning to a teacher
// @route   POST /api/admin/teachers/:id/warning
// @access  Admin
exports.issueWarning = async (req, res) => {
  try {
    const { remark } = req.body;

    if (!remark || !remark.trim()) {
      return res.status(400).json({
        success: false,
        message: "Warning remark is required",
      });
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    teacher.warnings.push({
      remark: remark.trim(),
      createdAt: new Date(),
    });

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Warning issued successfully",
      warnings: teacher.warnings,
    });
  } catch (error) {
    console.error("Error issuing warning:", error);
    res.status(500).json({
      success: false,
      message: "Failed to issue warning",
    });
  }
};

// @desc    Delete a warning from a teacher
// @route   DELETE /api/admin/teachers/:id/warning/:warningId
// @access  Admin
exports.deleteWarning = async (req, res) => {
  try {
    const { id, warningId } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    teacher.warnings = teacher.warnings.filter(
      (w) => w._id.toString() !== warningId
    );

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Warning deleted successfully",
      warnings: teacher.warnings,
    });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete warning",
    });
  }
};

// @desc    Delete teacher with audit reason
// @route   DELETE /api/admin/teachers/:id
// @access  Admin
exports.deleteTeacher = async (req, res) => {
  try {
    const { deletionReason } = req.body;

    if (!deletionReason || !deletionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Deletion reason is required",
      });
    }

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const userId = teacher.user;

    // Remove teacher profile
    await Teacher.findByIdAndDelete(req.params.id);

    // Mark user with deletion remark
    if (userId) {
      await User.findByIdAndUpdate(userId, {
       $set: {
          isDeleted: true,
          deletionReason: deletionReason.trim(),
          deletedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
    });
  }
};