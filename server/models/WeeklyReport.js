const mongoose = require("mongoose");
const weeklyReportSchema = new mongoose.Schema(
  {
    // Student
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Weekly Report Details
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Attachment
    attachment: {
      type: String,
      default: null,
    },

    // Submission Date
    submissionDate: {
      type: Date,
      required: true,
    },

    // Actual database submission time
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // Manager Verification
    managerVerified: {
      type: Boolean,
      default: false,
    },

    // Report Status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Rejection Remark
    rejectionRemark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One Report Per Student Per Week
weeklyReportSchema.index(
  {
    student: 1,
    weekNumber: 1,
  },
  {
    unique: true,
  }
);

// Count Submitted Reports
weeklyReportSchema.statics.getSubmittedReportCount =
  async function (studentId) {
    return await this.countDocuments({
      student: studentId,
    });
  };

module.exports = mongoose.model(
  "WeeklyReport",
  weeklyReportSchema
);