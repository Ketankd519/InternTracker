const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Manager = require("../models/Manager");

// HELPER: Convert stored signature path into a browser-accessible URL
const getSignatureUrl = (req, signature) => {
  if (!signature) {
    return "";
  }

  // Already a complete URL
  if (/^https?:\/\//i.test(signature)) {
    return signature;
  }

  const cleanPath = String(signature)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^uploads\//i, "");

  return `${req.protocol}://${req.get("host")}/uploads/${cleanPath}`;
};


// HELPER: Calculate certificate information for a student
const getCertificateDataForStudent = async (studentId, req) => {

  // =====================================================
  // STUDENT
  // =====================================================

  const student = await Student.findById(studentId)
    .populate("user", "name email role")
    .lean();

  if (!student) {
    throw new Error("Student not found");
  }

  // =====================================================
  // INTERNSHIP
  // =====================================================

  const internship = await Internship.findOne({
    student: studentId,
  }).lean();

  if (!internship) {
    throw new Error("Internship not found");
  }

  // =====================================================
  // TEACHER
  //
  // Student model stores teacherId as a STRING.
  // Teacher model also stores teacherId.
  // =====================================================

  const teacher = student.teacherId
    ? await Teacher.findOne({
        teacherId: student.teacherId,
      }).lean()
    : null;

  // =====================================================
  // MANAGER
  //
  // Internship model stores managerId as a STRING.
  // Manager model also stores managerId.
  // =====================================================

  const manager = internship.managerId
    ? await Manager.findOne({
        managerId: internship.managerId,
      }).lean()
    : null;

  // =====================================================
  // WEEKLY REPORTS
  // =====================================================

  const reports = await WeeklyReport.find({
    student: studentId,
  })
    .select("weekNumber")
    .lean();

  let currentWeek = 0;

  reports.forEach((report) => {
    const weekNumber = Number(report.weekNumber) || 0;

    if (weekNumber > currentWeek) {
      currentWeek = weekNumber;
    }
  });

  // =====================================================
  // PROGRESS
  // =====================================================

  const totalWeeks =
    Number(internship.totalWeeks) || 0;

  let progress = 0;

  if (totalWeeks > 0) {
    progress =
      (currentWeek / totalWeeks) * 100;
  }

  progress = Math.min(progress, 100);

  progress = Number(
    progress.toFixed(2)
  );

  // =====================================================
  // VERIFICATION
  //
  // IMPORTANT:
  // These DO NOT come from Certificate approval fields.
  // =====================================================

  const teacherVerified =
    student.teacherVerified === true;

  const managerVerified =
    internship.managerVerified === true;

  // =====================================================
  // CERTIFICATE
  // =====================================================

  let certificate =
    await Certificate.findOne({
      student: studentId,
    });

  // Create certificate record if it does not exist
  if (!certificate) {
    certificate = await Certificate.create({
      student: studentId,

      studentName:
        student.user?.name || "Student",

      companyName:
        internship.companyName || "",

      internshipStartDate:
        internship.startDate,

      internshipEndDate:
        internship.endDate,

      teacherName:
        student.teacherName ||
        teacher?.user?.name ||
        "",

      managerName:
        internship.managerName ||
        manager?.companyName ||
        "",

      certificateId:
        student._id,

      teacherApproved: false,
      managerApproved: false,

      isDownloadable: false,
      generated: false,
      generatedAt: null,
    });
  }

  // =====================================================
  // APPROVAL
  // =====================================================

  const teacherApproved =
    certificate.teacherApproved === true;

  const managerApproved =
    certificate.managerApproved === true;

  const certificateApproved =
    teacherApproved && managerApproved;

  // =====================================================
  // CERTIFICATE STATUS
  //
  // Verification is checked FIRST.
  // Progress is checked ONLY after both
  // teacher and manager are verified.
  // =====================================================

  let teacherStatus = "Not Eligible";
  let managerStatus = "Not Eligible";

  if (!teacherVerified && !managerVerified) {

    teacherStatus = "Not Eligible";
    managerStatus = "Not Eligible";

  } else if (teacherVerified && !managerVerified) {

    teacherStatus = "Eligible";
    managerStatus = "Not Eligible";

  } else if (!teacherVerified && managerVerified) {

    teacherStatus = "Not Eligible";
    managerStatus = "Eligible";

  } else if (teacherVerified && managerVerified) {

    if (progress <= 50) {

      teacherStatus = "Processing";
      managerStatus = "Processing";

    } else if (progress < 100) {

      teacherStatus = "Ongoing";
      managerStatus = "Ongoing";

    } else {

      teacherStatus = "Waiting for Approval";
      managerStatus = "Waiting for Approval";
    }
  }

  // =====================================================
  // FINAL APPROVAL STATUS
  //
  // Approval is separate from verification.
  // =====================================================

  if (teacherApproved) {
    teacherStatus = "Approved";
  }

  if (managerApproved) {
    managerStatus = "Approved";
  }

  // =====================================================
  // DOWNLOAD / GENERATION
  //
  // Only both approvals can unlock the certificate.
  // =====================================================

  if (certificateApproved) {

    if (!certificate.isDownloadable) {
      certificate.isDownloadable = true;
    }

    if (!certificate.generated) {
      certificate.generated = true;
      certificate.generatedAt = new Date();
    }

    if (!certificate.issueDate) {
      certificate.issueDate = new Date();
    }

    await certificate.save();
  }

  // =====================================================
  // SIGNATURE URLS
  // =====================================================

  const teacherSignature =
    teacherApproved && teacher?.signature
      ? getSignatureUrl(req, teacher.signature)
      : "";

  const managerSignature =
    managerApproved && manager?.signature
      ? getSignatureUrl(req, manager.signature)
      : "";

  // =====================================================
  // NAMES
  // =====================================================

  const finalTeacherName =
    student.teacherName ||
    certificate.teacherName ||
    teacher?.user?.name ||
    "Teacher Name";

  const finalManagerName =
    internship.managerName ||
    certificate.managerName ||
    "Manager Name";

  // =====================================================
  // RETURN DATA
  // =====================================================

  return {

    // ===================================================
    // NESTED DATA
    // Used by SSCertificate.jsx
    // ===================================================

    student: {
      _id: student._id,
      name:
        student.user?.name ||
        "Student",
      email:
        student.user?.email ||
        "",
      teacherId:
        student.teacherId || "",
    },

    internship: {
      _id: internship._id,
      companyName:
        internship.companyName || "",
      managerName:
        internship.managerName || "",
      startDate:
        internship.startDate || null,
      endDate:
        internship.endDate || null,
      status:
        internship.status || "",
      totalWeeks,
    },

    existingVerification: {
      teacherVerified,
      managerVerified,
    },

    progress: {
      currentWeek,
      totalWeeks,
      percentage: progress,
    },

    certificate: {
      _id:
        certificate._id,

      certificateId:
        certificate.certificateId,

      teacherName:
        finalTeacherName,

      managerName:
        finalManagerName,

      teacherApproved,
      managerApproved,

      teacherStatus,
      managerStatus,

      issueDate:
        certificate.issueDate,

      isDownloadable:
        certificate.isDownloadable === true,

      generated:
        certificate.generated === true,

      generatedAt:
        certificate.generatedAt || null,
    },

    // ===================================================
    // FLAT DATA
    // Used by Certificate.jsx
    // ===================================================

    studentName:
      certificate.studentName ||
      student.user?.name ||
      "Student",

    companyName:
      certificate.companyName ||
      internship.companyName ||
      "Company Name",

    internshipStartDate:
      certificate.internshipStartDate ||
      internship.startDate ||
      null,

    internshipEndDate:
      certificate.internshipEndDate ||
      internship.endDate ||
      null,

    teacherName:
      finalTeacherName,

    managerName:
      finalManagerName,

    certificateId:
      certificate.certificateId,

    // IMPORTANT
    teacherVerified,
    managerVerified,

    teacherApproved,
    managerApproved,

    // Signatures are ONLY returned after
    // their corresponding approval.
    teacherSignature,
    managerSignature,

    isDownloadable:
      certificate.isDownloadable === true,

    generated:
      certificate.generated === true,

    generatedAt:
      certificate.generatedAt || null,

    issueDate:
      certificate.issueDate || null,

    certificateApproved,
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
    }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const data =
      await getCertificateDataForStudent(
        student._id,
        req
      );

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
      await getCertificateDataForStudent(
        studentId,
        req
      );

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

      const studentUser =
        await User.findById(student.user)
          .select("name")
          .lean();

      certificate = await Certificate.create({
        student: studentId,

        studentName:
          studentUser?.name || "",

        companyName:
          internship.companyName,

        internshipStartDate:
          internship.startDate,

        internshipEndDate:
          internship.endDate,

        teacherName:
          student.teacherName || "",

        managerName:
          internship.managerName || "",

        certificateId:
          student._id,
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

   let certificate =
  await Certificate.findOne({
    student: studentId,
  });

if (!certificate) {

  const studentUser =
    await User.findById(student.user)
      .select("name")
      .lean();

  certificate = await Certificate.create({
    student: studentId,

    studentName:
      studentUser?.name || "",

    companyName:
      internship.companyName,

    internshipStartDate:
      internship.startDate,

    internshipEndDate:
      internship.endDate,

    teacherName:
      student.teacherName || "",

    managerName:
      internship.managerName || "",

    certificateId:
      student._id,
  });
}

    certificate.managerApproved = true;
    internship.status = "completed";
    await certificate.save();
    await internship.save();
    return res.status(200).json({
      success: true,
      message:
        "Manager certificate approval completed.",
      data: certificate,
       internship: {
        id: internship._id,
        status: internship.status,
       },
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