const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
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
    emailType: {
      type: String,
      enum: [
        "recruiter",
        "referral",
        "followup",
        "thankyou",
      ],
      required: true,
    },
    tone: {
      type: String,
      enum: ["formal", "friendly", "concise"],
      default: "formal",
    },
    recipientName: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    jobDescription: {
      type: String,
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Email", emailSchema);