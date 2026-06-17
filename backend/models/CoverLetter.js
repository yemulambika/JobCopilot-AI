const mongoose = require("mongoose");

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      enum: ["professional", "enthusiastic", "formal", "casual"],
      default: "professional",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CoverLetter", coverLetterSchema);