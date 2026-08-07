const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    managerApproved: {
      type: Boolean,
      default: false,
    },
    teacherApproved: {
      type: Boolean,
      default: false,
    },
    managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    },
    teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    },
    certificateFile: {
    type: String,
    },
    isDownloadable: {
    type: Boolean,
    default: false,
    },
    managerSignature: {
      type: String, // File path, base64, or URL
    },
    teacherSignature: {
      type: String, // File path, base64, or URL
    },
    generated: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);