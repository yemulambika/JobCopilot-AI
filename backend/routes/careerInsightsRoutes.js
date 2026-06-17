const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { analyzeCareer } = require("../controllers/careerInsightsController");

// @route   POST /api/career-insights/analyze
// @desc    Generate AI career insights from resume
router.post("/analyze", protect, analyzeCareer);

module.exports = router;