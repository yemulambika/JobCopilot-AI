const mongoose = require("mongoose");

const resumeVersionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    masterResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      default: "Original",
    },
    type: {
      type: String,
      enum: ["original", "tailored"],
      default: "original",
    },
    content: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    versionNumber: {
      type: Number,
      default: 1,
    },
    metadata: {
      companyName: { type: String, default: "" },
      roleTitle: { type: String, default: "" },
      skills: [{ type: String }],
      atsScore: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

resumeVersionSchema.index({ userId: 1, masterResumeId: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeVersion", resumeVersionSchema);