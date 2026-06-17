const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  generateEmail,
  getEmails,
  getEmail,
  deleteEmail,
} = require("../controllers/emailController");

// All routes are protected
router.use(protect);

// @route   POST /api/emails/generate
// @desc    Generate an AI email
router.post("/generate", generateEmail);

// @route   GET /api/emails
// @desc    Get all emails for current user
router.get("/", getEmails);

// @route   GET /api/emails/:id
// @desc    Get a single email
router.get("/:id", getEmail);

// @route   DELETE /api/emails/:id
// @desc    Delete an email
router.delete("/:id", deleteEmail);

module.exports = router;