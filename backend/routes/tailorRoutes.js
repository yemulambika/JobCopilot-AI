const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  tailorResume,
  getTailoredResumes,
  getTailoredResume,
  deleteTailoredResume,
} = require("../controllers/tailorController");

// All routes are protected
router.use(protect);

// @route   POST /api/tailor
// @desc    Tailor a resume to a specific job description
router.post("/", tailorResume);

// @route   GET /api/tailor
// @desc    Get all tailored resumes
router.get("/", getTailoredResumes);

// @route   GET /api/tailor/:id
// @desc    Get a single tailored resume
router.get("/:id", getTailoredResume);

// @route   DELETE /api/tailor/:id
// @desc    Delete a tailored resume
router.delete("/:id", deleteTailoredResume);

module.exports = router;