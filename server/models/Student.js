const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema(
  {
    // Link with User collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // Personal Details
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    // Academic Details
    college: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
    },

    rollNo: {
      type: String,
      required: true,
      trim: true,
    },

    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    teacherId: {
      type: String,
      required: true,
      trim: true,
    },

    teacherName: {
      type: String,
      trim: true,
      default: "",
    },

    teacherNo: {
      type: String,
      required: true,
      trim: true,
    },
    
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Profile Status
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // Student Verification
    teacherVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);