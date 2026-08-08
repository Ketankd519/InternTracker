const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

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

    attachment: {
      type: String,
      default: null,
    },

    // Date entered by student
    submissionDate: {
      type: Date,
      required: true,
    },

    // Date/time when report was actually submitted
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    managerVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// One report per student per week
weeklyReportSchema.index(
  { student: 1, weekNumber: 1 },
  { unique: true }
);

// Count submitted reports
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