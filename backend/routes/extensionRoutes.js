const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { submitJobFromExtension, answerQuestion } = require("../controllers/extensionController");

// @route   POST /api/extension/submit-job
// @desc    Submit job from Chrome extension (optional auth)
router.post("/submit-job", (req, res, next) => {
  // Optional auth — try to extract token if present, but don't fail if missing
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const jwt = require("jsonwebtoken");
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
      req.user = { id: decoded.id };
    } catch {
      // Token invalid — proceed without auth
    }
  }
  next();
}, submitJobFromExtension);

// @route   POST /api/extension/answer-question
// @desc    Generate AI answer for a job application question
router.post("/answer-question", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const jwt = require("jsonwebtoken");
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
      req.user = { id: decoded.id };
    } catch { /* token invalid — proceed without auth */ }
  }
  next();
}, answerQuestion);

module.exports = router;
