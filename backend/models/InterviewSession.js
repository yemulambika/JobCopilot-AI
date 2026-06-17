const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    jobDescription: { type: String, required: true },
    questions: [
      {
        type: String,
        required: true,
      },
    ],
    responses: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        score: { type: Number }, // 0-100
        feedback: { type: String },
      },
    ],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);