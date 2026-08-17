const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");

// HELPER: Calculate certificate information for a student
const getCertificateDataForStudent = async (studentId) => {
  
  // Find student
  const student = await Student.findById(studentId)
    .populate("user", "name email role")
    .lean();

  if (!student) {
    throw new Error("Student not found");
  }

  // Find internship
  const internship = await Internship.findOne({student: studentId,}).lean();

  if (!internship) {throw new Error("Internship not found");}

  // Find weekly reports
  const reports = await WeeklyReport.find({student: studentId,})
    .select("weekNumber")
    .lean();

  // Find highest submitted week number
  let currentWeek = 0;

  reports.forEach((report) => {const weekNumber = Number(report.weekNumber) || 0;

    if (weekNumber > currentWeek) {
      currentWeek = weekNumber;
    }
  });

  // Calculate progress
  const totalWeeks = Number(internship.totalWeeks) || 0;

  let progress = 0;
  if (totalWeeks > 0) {
    progress = (currentWeek / totalWeeks) * 100;
  }

  // Never allow progress above 100
  progress = Math.min(progress, 100);

  // Round to 2 decimal places
  progress = Number(progress.toFixed(2));

  // Existing verification
  const teacherVerified = student.teacherVerified === true;
  const managerVerified = internship.managerVerified === true;

  // Find or create certificate document
  let certificate = await Certificate.findOne({student: studentId,});

  if (!certificate) {
    certificate = await Certificate.create({
      student: studentId,
      studentName: student.user?.name || "Student",
      companyName: internship.companyName || "",
      internshipStartDate: internship.startDate,
      internshipEndDate: internship.endDate,
      teacherName: student.teacherId || "",
      managerName: internship.managerName || "",
      certificateId: student._id.toString(),
      teacherApproved: false,
      managerApproved: false,
      isDownloadable: false,
      generated: false,
      generatedAt: null,
    });
  }

  // Calculate certificate status
  let teacherStatus = "Not Eligible";
  let managerStatus = "Not Eligible";

  // First condition:
  // Existing verification
  if (teacherVerified && managerVerified) {
    teacherStatus = "Processing";
    managerStatus = "Processing";
  } else if (teacherVerified && !managerVerified) {
    teacherStatus = "Eligible";
    managerStatus = "Not Eligible";
  } else if (!teacherVerified && managerVerified) {
    teacherStatus = "Not Eligible";
    managerStatus = "Eligible";
  } else {
    teacherStatus = "Not Eligible";
    managerStatus = "Not Eligible";
  }

  // Progress condition
  if (progress <= 50) {
    teacherStatus = "Ongoing";
    managerStatus = "Ongoing";
  }

  // Internship completion condition
  const internshipCompleted =
    progress === 100 ||
    internship.status === "completed";

  if (internshipCompleted) {
    teacherStatus = "Waiting for Approval";
    managerStatus = "Waiting for Approval";
  }

  // Final certificate approval
  if (
    certificate.teacherApproved === true &&
    certificate.managerApproved === true
  ) {
    teacherStatus = "Approved";
    managerStatus = "Approved";

    // Certificate is downloadable only
    // after both approvals.
    if (!certificate.isDownloadable) {
      certificate.isDownloadable = true;
    }

    // Generate certificate information once
    if (!certificate.generated) {
      certificate.generated = true;
      certificate.generatedAt = new Date();
    }

    if (!certificate.issueDate) {
      certificate.issueDate = new Date();
    }
    await certificate.save();
  }

  return {
    student: {
      _id: student._id,
      name: student.user?.name || "Student",
      email: student.user?.email || "",
    },

    internship: {
      companyName: internship.companyName,
      startDate: internship.startDate,
      endDate: internship.endDate,
      status: internship.status,
      totalWeeks: totalWeeks,
    },

    progress: {
      currentWeek,
      totalWeeks,
      percentage: progress,
    },

    existingVerification: {
      teacherVerified,
      managerVerified,
    },

    certificate: {
      _id: certificate._id,
      certificateId: certificate.certificateId,
      teacherName: certificate.teacherName,
      managerName: certificate.managerName,
      teacherApproved: certificate.teacherApproved,
      managerApproved: certificate.managerApproved,
      teacherStatus,
      managerStatus,
      issueDate: certificate.issueDate,
      isDownloadable: certificate.isDownloadable,
      generated: certificate.generated,
      generatedAt: certificate.generatedAt,
    },
  };
};


// GET MY CERTIFICATE STATUS
// Student
// GET /api/certificates/status
const getMyCertificateStatus = async (req, res) => {
  try {
    // Find logged-in student's profile
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

      // ====================================================
      // FETCH EXISTING CERTIFICATE
      // ====================================================

      const certificate = await Certificate.findOne({
        student: student._id,
      }).lean();

      // Certificate has not been generated/stored yet
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate has not been generated yet.",
        });
      }

      // ====================================================
      // RETURN ONLY THE STORED CERTIFICATE DATA
      // ====================================================

      return res.status(200).json({
        success: true,

        data: {
          _id: certificate._id,

          student: certificate.student,

          studentName: certificate.studentName,

          companyName: certificate.companyName,

          internshipStartDate:
            certificate.internshipStartDate,

          internshipEndDate:
            certificate.internshipEndDate,

          teacherName: certificate.teacherName,

          managerName: certificate.managerName,

          issueDate: certificate.issueDate,

          certificateId: certificate.certificateId,

          teacherApproved:
            certificate.teacherApproved === true,

          managerApproved:
            certificate.managerApproved === true,

          isDownloadable:
            certificate.isDownloadable === true,

          generated:
            certificate.generated === true,

          generatedAt: certificate.generatedAt,

          createdAt: certificate.createdAt,

          updatedAt: certificate.updatedAt,
        },
      });

    const data =
      await getCertificateDataForStudent(student._id);
    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "Get My Certificate Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching certificate status",
      error: error.message,
    });
  }
};

// GET SINGLE STUDENT CERTIFICATE
// Teacher / Manager
// GET /api/certificates/student/:studentId
const getStudentCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const data =
      await getCertificateDataForStudent(studentId);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "Get Student Certificate Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching student certificate",
      error: error.message,
    });
  }
};


// GET STUDENTS FOR TEACHER / MANAGER
const getCertificateStudentList = async (req, res) => {
  try {
    // Only students whose existing
    // teacher verification is true
    const students = await Student.find({
      teacherVerified: true,
    })
      .populate("user", "name email")
      .lean();

    const result = [];
    for (const student of students) {
      const internship =
        await Internship.findOne({
          student: student._id,
        }).lean();

      if (!internship) {
        continue;
      }

      const certificate =
        await Certificate.findOne({
          student: student._id,
        }).lean();

      const reports =
        await WeeklyReport.find({
          student: student._id,
        })
          .select("weekNumber")
          .lean();
      let currentWeek = 0;
      reports.forEach((report) => {
        const week = Number(report.weekNumber) || 0;

        if (week > currentWeek) {
          currentWeek = week;
        }
      });

      const totalWeeks = Number(internship.totalWeeks) || 0;
      let progress = 0;
      if (totalWeeks > 0) {
        progress = (currentWeek / totalWeeks) * 100;
      }

      progress = Math.min(progress, 100);
      result.push({ 
        studentId: student._id,
        studentName: student.user?.name || "Student",
        internshipStatus: internship.status,
        managerVerified: internship.managerVerified,
        teacherApproved: certificate?.teacherApproved || false,
        managerApproved: certificate?.managerApproved || false,
        progress: Number(progress.toFixed(2)),
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  } catch (error) {
    console.error(
      "Certificate Student List Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching certificate student list",
      error: error.message,
    });
  }
};


// TEACHER APPROVES CERTIFICATE
// PUT /api/certificates/:studentId/teacher-approve
const approveCertificateByTeacher = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Existing teacher verification
    if (!student.teacherVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Student is not verified by teacher yet.",
      });
    }

    // Find internship
    const internship =
      await Internship.findOne({
        student: studentId,
      });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Create certificate if it doesn't exist
    let certificate =
      await Certificate.findOne({
        student: studentId,
      });

    if (!certificate) {
      certificate = await Certificate.create({
        student: studentId,
        studentName: student.user?.name || "",
        companyName: internship.companyName,
        internshipStartDate: internship.startDate,
        internshipEndDate: internship.endDate,
        teacherName: student.teacherId || "",
        managerName: internship.managerName || "",
        certificateId: student._id.toString(),
      });
    }

    certificate.teacherApproved = true;
    await certificate.save();
    return res.status(200).json({
      success: true,
      message:
        "Teacher certificate approval completed.",
      data: certificate,
    });

  } catch (error) {
    console.error(
      "Teacher Certificate Approval Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error approving certificate by teacher",
      error: error.message,
    });
  }
};

// MANAGER APPROVES CERTIFICATE
// PUT /api/certificates/:studentId/manager-approve
const approveCertificateByManager = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const internship = await Internship.findOne({
        student: studentId,
      });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Existing manager verification
    if (!internship.managerVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Student is not verified by manager yet.",
      });
    }

    // Create certificate if needed
    let certificate =
      await Certificate.findOne({
        student: studentId,
      });

    if (!certificate) {
      certificate = await Certificate.create({
        student: studentId,
        studentName: student.user?.name || "",
        companyName: internship.companyName,
        internshipStartDate: internship.startDate,
        internshipEndDate: internship.endDate,
        teacherName: student.teacherId || "",
        managerName: internship.managerName || "",
        certificateId: student._id.toString(),
      });
    }

    certificate.managerApproved = true;
    await certificate.save();
    return res.status(200).json({
      success: true,
      message:
        "Manager certificate approval completed.",
      data: certificate,
    });

  } catch (error) {
    console.error(
      "Manager Certificate Approval Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error approving certificate by manager",
      error: error.message,
    });
  }
};

// EXPORT
module.exports = {
  getMyCertificateStatus,
  getStudentCertificate,
  getCertificateStudentList,
  approveCertificateByTeacher,
  approveCertificateByManager,
};