const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
} = require("../controllers/coverLetterController");

// All routes are protected
router.use(protect);

// @route   POST /api/cover-letters/generate
// @desc    Generate a cover letter with AI
router.post("/generate", generateCoverLetter);

// @route   GET /api/cover-letters
// @desc    Get all cover letters for current user
router.get("/", getCoverLetters);

// @route   GET /api/cover-letters/:id
// @desc    Get a single cover letter
router.get("/:id", getCoverLetter);

// @route   DELETE /api/cover-letters/:id
// @desc    Delete a cover letter
router.delete("/:id", deleteCoverLetter);

module.exports = router;