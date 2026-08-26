const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    managerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    mobileNo: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    signature: {
      type: String,
      default: "",
    },

    // Warnings Array for Admin functionality
    warnings: [
      {
        remark: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Manager", managerSchema);