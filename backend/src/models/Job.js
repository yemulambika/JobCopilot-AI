const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    source: { type: String, required: true }, // LinkedIn, Naukri, etc.
    jd: { type: String, required: true }, // job description text
    url: { type: String, required: true, unique: true },
    salary: { type: String },
    employmentType: { type: String },
    postedDate: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index for deduplication (company+title+location)
JobSchema.index({ company: 1, title: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Job', JobSchema);