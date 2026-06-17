const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  downloadTailoredResumePDF,
  downloadCoverLetterPDF,
} = require("../controllers/exportController");

// All routes require authentication
router.use(protect);

// @route   GET /api/export/tailored-resume/:id/pdf
// @desc    Download a tailored resume as PDF
router.get("/tailored-resume/:id/pdf", downloadTailoredResumePDF);

// @route   GET /api/export/cover-letter/:id/pdf
// @desc    Download a cover letter as PDF
router.get("/cover-letter/:id/pdf", downloadCoverLetterPDF);

module.exports = router;