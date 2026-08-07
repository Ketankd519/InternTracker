const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    managerName: {
      type: String,
      trim: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerEmail: {
      type: String,
      trim: true,
    },
    managerPhone: {
      type: String,
      trim: true,
    },
    internshipRole: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalWeeks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Internship', internshipSchema);