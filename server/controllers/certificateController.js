const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const Internship = require('../models/Internship');

/**
 * @desc    Approve certificate by Industry Manager
 * @route   PUT /api/certificates/:student/manager-approve
 * @access  Private (Manager / Admin)
 */
const managerApprove = async (req, res) => {
  try {
    const { studentId  } = req.params;
    const { managerName, managerSignature } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Find existing certificate record or create standard entry
    let certificate = await Certificate.findOne({ student });

    if (!certificate) {
      certificate = new Certificate({ student });
    }

    // Update manager approval details
    certificate.managerApproved = true;
    if (managerName) certificate.managerName = managerName;
    if (managerSignature) certificate.managerSignature = managerSignature;

    // Auto-generate certificate if teacher has also approved
    if (certificate.teacherApproved) {
      certificate.generated = true;
      certificate.generatedAt = new Date();
    }

    const savedCertificate = await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate approved by manager successfully',
      data: savedCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving certificate by manager',
      error: error.message,
    });
  }
};

/**
 * @desc    Approve certificate by Teacher / Academic Guide
 * @route   PUT /api/certificates/:student/teacher-approve
 * @access  Private (Teacher / Admin)
 */
const teacherApprove = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherName, teacherSignature } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    let certificate = await Certificate.findOne({ student });

    if (!certificate) {
      certificate = new Certificate({ student });
    }

    // Update teacher approval details
    certificate.teacherApproved = true;
    if (teacherName) certificate.teacherName = teacherName;
    if (teacherSignature) certificate.teacherSignature = teacherSignature;

    // Auto-generate certificate if manager has also approved
    if (certificate.managerApproved) {
      certificate.generated = true;
      certificate.generatedAt = new Date();
    }

    const savedCertificate = await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate approved by teacher successfully',
      data: savedCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving certificate by teacher',
      error: error.message,
    });
  }
};

/**
 * @desc    Explicitly trigger certificate generation
 * @route   POST /api/certificates/:student/generate
 * @access  Private (Admin / Teacher / Manager)
 */
const generateCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;

    const certificate = await Certificate.findOne({ student });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate record not found for this student',
      });
    }

    // Ensure both approvals are present before issuing
    if (!certificate.managerApproved || !certificate.teacherApproved) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot generate certificate. Requires both Manager and Teacher approvals.',
        approvalStatus: {
          managerApproved: certificate.managerApproved,
          teacherApproved: certificate.teacherApproved,
        },
      });
    }

    certificate.generated = true;
    certificate.generatedAt = new Date();

    const updatedCertificate = await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      data: updatedCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Certificate Details & Status
 * @route   GET /api/certificates/:student
 * @access  Private (Student / Teacher / Manager)
 */
const getCertificateStatus = async (req, res) => {
  try {
    let studentId  = req.params.studentId;

    // If logged in as student and no param provided, find by user ID
    if (!student || student === 'me') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }
      student = student._id;
    }

    const certificate = await Certificate.findOne({ student }).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate status found for this student',
      });
    }

    // Fetch internship info for complete certificate view payload
    const internship = await Internship.findOne({ student });

    res.status(200).json({
      success: true,
      data: {
        certificate,
        internship,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate status',
      error: error.message,
    });
  }
};

module.exports = {
  managerApprove,
  teacherApprove,
  generateCertificate,
  getCertificateStatus,
};