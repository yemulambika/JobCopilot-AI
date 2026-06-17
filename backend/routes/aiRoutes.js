const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { generate, analyzeResume, generateCoverLetter } = require("../controllers/aiController");

// @route   POST /api/ai/generate
// @desc    Generate AI response from a custom prompt
router.post("/generate", protect, generate);

// @route   POST /api/ai/analyze-resume
// @desc    Analyze a resume with AI (with or without job description)
router.post("/analyze-resume", protect, analyzeResume);

// @route   POST /api/ai/cover-letter
// @desc    Generate a cover letter using AI
router.post("/cover-letter", protect, generateCoverLetter);

module.exports = router;