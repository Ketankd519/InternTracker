const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    // Student Reference
    // Same Student _id used throughout the project
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

    // Certificate Details
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    internshipStartDate: {
      type: Date,
      required: true,
    },

    internshipEndDate: {
      type: Date,
      required: true,
    },

    // Teacher / Manager Details
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },

    managerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Certificate Information
    issueDate: {
      type: Date,
      default: null,
    },

    // Certificate ID is the same as Student _id
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

    // Certificate Approval
    // Teacher changes this from false → true
    teacherApproved: {
      type: Boolean,
      default: false,
    },

    // Manager changes this from false → true
    managerApproved: {
      type: Boolean,
      default: false,
    },

    // Certificate generation/download information
    isDownloadable: {
      type: Boolean,
      default: false,
    },

    generated: {
      type: Boolean,
      default: false,
    },

    generatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Certificate",
  certificateSchema
);