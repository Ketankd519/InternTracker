const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Manager = require("../models/Manager");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");
const Certificate = require("../models/Certificate");

// Helper function to calculate Verified status:
// Condition:
// 1. teacherVerified === false && managerVerified === false -> "Not Verified"
// 2. teacherVerified === true  && managerVerified === false -> "Partially Verified"
// 3. teacherVerified === false && managerVerified === true  -> "Partially Verified"
// 4. teacherVerified === true  && managerVerified === true  -> "Verified"
const computeVerifiedStatus = (teacherVerified, managerVerified) => {
  const isTeacherV = Boolean(teacherVerified);
  const isManagerV = Boolean(managerVerified);

  if (!isTeacherV && !isManagerV) return "Not Verified";
  if (isTeacherV && !isManagerV) return "Partially Verified";
  if (!isTeacherV && isManagerV) return "Partially Verified";
  if (isTeacherV && isManagerV) return "Verified";
  return "Not Verified";
};

// Helper function to calculate Approved status (from certificates collection)
const computeApprovedStatus = (teacherApproved, managerApproved) => {
  const isTeacherA = Boolean(teacherApproved);
  const isManagerA = Boolean(managerApproved);

  if (!isTeacherA && !isManagerA) return "Not Approved";
  if (isTeacherA && !isManagerA) return "Partially Approved";
  if (!isTeacherA && isManagerA) return "Partially Approved";
  if (isTeacherA && isManagerA) return "Approved";
  return "Not Approved";
};

// @desc    Get all students with computed status for Admin
// @route   GET /api/admin/students
// @access  Admin
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email")
      .lean();

    const studentList = await Promise.all(
      students.map(async (std) => {
        const studentUserId = std.user?._id || std.user;

        // 1. Fetch Internship document (matches studentId, student, user, or userId)
        const internship = await Internship.findOne({
          $or: [
            { studentId: std._id },
            { student: std._id },
            ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
          ],
        }).lean();

        // 2. Fetch Certificate document for Approved status
        const certificate = await Certificate.findOne({
          $or: [
            { studentId: std._id },
            { student: std._id },
            ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
          ],
        }).lean();

        // 3. VERIFIED: strictly from Student.teacherVerified and Internship.managerVerified
        const teacherVerified = Boolean(std.teacherVerified);
        const managerVerified = Boolean(internship?.managerVerified);
        const verifiedStatus = computeVerifiedStatus(teacherVerified, managerVerified);

        // 4. APPROVED: strictly from Certificate.teacherApproved and Certificate.managerApproved
        const teacherApproved = Boolean(certificate?.teacherApproved);
        const managerApproved = Boolean(certificate?.managerApproved);
        const approvedStatus = computeApprovedStatus(teacherApproved, managerApproved);

        // 5. Direct fields from Internship document
        const managerName = internship?.managerName || "Not Assigned";
        const totalWeeks = internship?.totalweeks ?? internship?.totalWeeks ?? 0;
        const internshipStatus = internship?.status || "Not Started";

        return {
          _id: std._id,
          userId: studentUserId,
          studentName: std.user?.name || "N/A",
          rollNumber: std.rollNo || std.rollNumber || "N/A",
          teacherName: std.teacherName || "Not Assigned",
          managerName: managerName,
          totalWeeks: totalWeeks,
          internshipStatus: internshipStatus,
          verified: verifiedStatus,
          approved: approvedStatus,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentList,
    });
  } catch (error) {
    console.error("Error fetching admin students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student lists",
    });
  }
};

// @desc    Get complete student profile for Admin view page
// @route   GET /api/admin/students/:id
// @access  Admin
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email role")
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const studentUserId = student.user?._id || student.user;

    const internship = await Internship.findOne({
      $or: [
        { studentId: student._id },
        { student: student._id },
        ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
      ],
    }).lean();

    const weeklyReports = await WeeklyReport.find({
      $or: [
        { studentId: student._id },
        { student: student._id },
        ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
      ],
    })
      .sort({ weekNumber: 1 })
      .lean();

    res.status(200).json({
      success: true,
      student: {
        user: student.user,
        student,
        internship,
        weeklyReports,
      },
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
    });
  }
};

// @desc    Reject Student Internship with reason
// @route   PUT /api/admin/students/:id/reject
// @access  Admin
exports.rejectInternship = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection remark/reason is required",
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const studentUserId = student.user?._id || student.user;

    const updatedInternship = await Internship.findOneAndUpdate(
      {
        $or: [
          { studentId: student._id },
          { student: student._id },
          ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
        ],
      },
      {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        rejectedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Internship rejected successfully",
      data: updatedInternship,
    });
  } catch (error) {
    console.error("Error rejecting internship:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject internship",
    });
  }
};

// @desc    Delete Student & cleanup related records with deletion reason
// @route   DELETE /api/admin/students/:id
// @access  Admin
exports.deleteStudent = async (req, res) => {
  try {
    const { deletionReason } = req.body;

    if (!deletionReason || !deletionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Deletion reason is required",
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const userId = student.user?._id || student.user;

    // 1. Delete associated child documents
    await WeeklyReport.deleteMany({
      $or: [{ studentId: student._id }, { student: student._id }, { user: userId }],
    });
    await Certificate.deleteMany({
      $or: [{ studentId: student._id }, { student: student._id }, { user: userId }],
    });
    await Internship.deleteMany({
      $or: [{ studentId: student._id }, { student: student._id }, { user: userId }],
    });
    await Student.findByIdAndDelete(student._id);

    // 2. Update user record with audit info
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isDeleted: true,
        deletionReason: deletionReason.trim(),
        deletedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Student and all related records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
};