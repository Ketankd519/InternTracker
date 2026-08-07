const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
    },
    attachment: {
      type: String, // Optional URL or file path
      default: null,
    },
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
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensures a student can only submit one report per week number
weeklyReportSchema.index({ student: 1, weekNumber: 1 }, { unique: true });

// Static helper to count total weekly reports submitted by a student
weeklyReportSchema.statics.getSubmittedReportCount = async function (studentId) {
  return await this.countDocuments({ student: studentId });
};

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);