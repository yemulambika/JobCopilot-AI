const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const resumeController = require("../controllers/resumeController");

const {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  matchResume,
} = resumeController;

// ─── Resume CRUD (authenticated) ───────────────────────────

// @route   POST /api/resumes/upload
// @desc    Upload and parse PDF or DOCX resume
router.post("/resumes/upload", protect, upload.single("resume"), uploadResume);

// @route   GET /api/resumes
// @desc    Get all resumes for current user
router.get("/resumes", protect, getResumes);

// @route   GET /api/resumes/:id
// @desc    Get a single resume with extracted text
router.get("/resumes/:id", protect, getResume);

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
router.delete("/resumes/:id", protect, deleteResume);

// ─── Legacy endpoints (preserved for backward compatibility) ───

// @route   POST /api/upload
// @desc    Legacy upload endpoint (public)
router.post("/upload", upload.single("resume"), uploadResume);

// @route   POST /api/match
// @desc    Match resume text against job description
router.post("/match", matchResume);

module.exports = router;
