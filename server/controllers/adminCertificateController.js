const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const User = require("../models/User");

// @desc    Get all eligible certificate students
// @route   GET /api/admin/certificates
// @access  Admin
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().lean();

    const certificateList = await Promise.all(
      certificates.map(async (cert) => {
        const studentId = cert.student || cert.studentId;

        // 1. Resolve Student details
        let student = null;
        if (studentId) {
          student = await Student.findById(studentId)
            .populate("user", "name email")
            .lean();
        }

        const studentUserId = student?.user?._id || student?.user;

        // 2. Resolve Internship details
        const internship = await Internship.findOne({
          $or: [
            { student: studentId },
            { studentId: studentId },
            ...(studentUserId ? [{ user: studentUserId }, { userId: studentUserId }] : []),
          ],
        }).lean();

        // Resolving Teacher and Manager details
        const studentName = student?.fullName || student?.user?.name || "N/A";
        const teacherName = student?.teacherName || "Not Assigned";
        const managerName = internship?.managerName || "Not Assigned";
        const endingDate =
          internship?.endDate ||
          internship?.endingDate ||
          internship?.completionDate ||
          null;
        const startingDate =
          internship?.startDate ||
          internship?.startingDate ||
          internship?.joiningDate ||
          null;

        const role =
          internship?.internshipRole ||
          internship?.jobRole ||
          internship?.title ||
          internship?.role ||
          "N/A";

        return {
          _id: cert._id,
          studentId: studentId,
          studentName,
          rollNumber: student?.rollNo || student?.rollNumber || "N/A",
          companyName: internship?.companyName || "Not Assigned",
          jobRole: role,
          startingDate,
          endingDate,
          internshipStatus: internship?.status || "Not Started",
          teacherName,
          teacherApproved: Boolean(cert.teacherApproved),
          managerName,
          managerApproved: Boolean(cert.managerApproved),
          certificateNo: cert.certificateNo || "N/A",
          createdAt: cert.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: certificateList.length,
      data: certificateList,
    });
  } catch (error) {
    console.error("Error fetching certificates for admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate records",
      error: error.message,
    });
  }
};