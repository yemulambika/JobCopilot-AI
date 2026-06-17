const mongoose = require("mongoose");

const tailoredResumeSchema = new mongoose.Schema(
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
    jobDescription: {
      type: String,
      required: true,
    },
    tailoredSummary: {
      type: String,
      default: "",
    },
    optimizedSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    improvedExperience: [
      {
        original: { type: String },
        improved: { type: String },
      },
    ],
    atsKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    rawResponse: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TailoredResume", tailoredResumeSchema);