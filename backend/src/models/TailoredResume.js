const mongoose = require('mongoose');

const TailoredResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    masterResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    jobDescription: { type: String, required: true },
    tailoredSummary: { type: String, default: '' },
    optimizedSkills: { type: [String], default: [] },
    improvedExperience: {
      type: [
        {
          original: { type: String },
          improved: { type: String },
        },
      ],
      default: [],
    },
    atsKeywords: { type: [String], default: [] },
    rawResponse: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TailoredResume', TailoredResumeSchema);