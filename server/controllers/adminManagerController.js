const User = require("../models/User");
const Manager = require("../models/Manager");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const Certificate = require("../models/Certificate");

// @desc    Get all managers with assigned, verified, approved student counts
// @route   GET /api/admin/managers
// @access  Admin
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate("user", "name email role")
      .lean();

    const managerList = await Promise.all(
      managers.map(async (mgr) => {
        // Find all internships assigned to this manager
        const internships = await Internship.find({
          $or: [
            { managerId: mgr.managerId },
            { managerId: mgr._id.toString() },
            { manager: mgr._id },
            { managerEmail: mgr.email },
            { managerName: mgr.name },
          ],
        }).lean();

        const totalAssigned = internships.length;

        // Total students verified by this manager (from internships collection)
        const totalVerified = internships.filter(
          (item) => item.managerVerified === true
        ).length;

        // Total students approved by this manager (from certificates collection)
        const studentIds = internships
          .map((i) => i.studentId || i.student || i.user || i.userId)
          .filter(Boolean);

        const totalApproved = await Certificate.countDocuments({
          $or: [
            { studentId: { $in: studentIds } },
            { student: { $in: studentIds } },
          ],
          managerApproved: true,
        });

        return {
          _id: mgr._id,
          managerName: mgr.name || mgr.user?.name || "N/A",
          managerId: mgr.managerId || "N/A",
          companyName: mgr.companyName || "N/A",
          totalAssignedStudents: totalAssigned,
          totalVerifiedStudents: totalVerified,
          totalApprovedStudents: totalApproved,
          warningCount: mgr.warnings ? mgr.warnings.length : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: managerList,
    });
  } catch (error) {
    console.error("Error fetching admin managers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch managers list",
    });
  }
};

// @desc    Get complete manager profile, assigned internships & warnings
// @route   GET /api/admin/managers/:id
// @access  Admin
exports.getManagerProfile = async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id)
      .populate("user", "name email role isDeleted deletionReason deletedAt")
      .lean();

    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    // Fetch assigned internships without strict populate
    const internships = await Internship.find({
      $or: [
        { managerId: manager.managerId },
        { managerId: manager._id.toString() },
        { manager: manager._id },
        { managerEmail: manager.email },
        { managerName: manager.name },
      ],
    }).lean();

    // Fetch student information manually to avoid StrictPopulateError
    const assignedStudents = await Promise.all(
      internships.map(async (item) => {
        const studentRef = item.student || item.studentId || item.user || item.userId;
        let studentDetails = null;

        if (studentRef) {
          studentDetails = await Student.findOne({
            $or: [
              { _id: studentRef },
              { user: studentRef },
            ],
          })
            .populate("user", "name email")
            .lean();
        }

        return {
          _id: item._id,
          studentName:
            studentDetails?.user?.name ||
            studentDetails?.name ||
            item.studentName ||
            "N/A",
          rollNo: studentDetails?.rollNo || studentDetails?.rollNumber || "N/A",
          companyName: item.companyName || manager.companyName,
          jobRole: item.jobRole || item.title || "Intern",
          totalWeeks: item.totalweeks ?? item.totalWeeks ?? 0,
          status: item.status || "ongoing",
          managerVerified: Boolean(item.managerVerified),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        manager,
        assignedStudents,
        warnings: manager.warnings || [],
      },
    });
  } catch (error) {
    console.error("Error fetching manager profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager profile",
    });
  }
};

// @desc    Issue a warning to a manager
// @route   POST /api/admin/managers/:id/warning
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

    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    manager.warnings.push({
      remark: remark.trim(),
      createdAt: new Date(),
    });

    await manager.save();

    res.status(200).json({
      success: true,
      message: "Warning issued successfully",
      warnings: manager.warnings,
    });
  } catch (error) {
    console.error("Error issuing manager warning:", error);
    res.status(500).json({
      success: false,
      message: "Failed to issue warning",
    });
  }
};

// @desc    Delete a warning from a manager
// @route   DELETE /api/admin/managers/:id/warning/:warningId
// @access  Admin
exports.deleteWarning = async (req, res) => {
  try {
    const { id, warningId } = req.params;

    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    manager.warnings = manager.warnings.filter(
      (w) => w._id.toString() !== warningId
    );

    await manager.save();

    res.status(200).json({
      success: true,
      message: "Warning removed successfully",
      warnings: manager.warnings,
    });
  } catch (error) {
    console.error("Error deleting warning:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete warning",
    });
  }
};

// @desc    Delete manager with audit reason
// @route   DELETE /api/admin/managers/:id
// @access  Admin
exports.deleteManager = async (req, res) => {
  try {
    const { deletionReason } = req.body;

    if (!deletionReason || !deletionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Deletion reason is required",
      });
    }

    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    const userId = manager.user;

    // Remove manager profile
    await Manager.findByIdAndDelete(req.params.id);

    // Update user record with audit remark
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
      message: "Manager deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting manager:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete manager",
    });
  }
};