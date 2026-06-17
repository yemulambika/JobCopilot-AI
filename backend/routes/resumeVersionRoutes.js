const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getVersions,
  getVersion,
  createVersion,
  restoreVersion,
  compareVersions,
  downloadVersion,
  deleteVersion,
} = require("../controllers/resumeVersionController");

// @route   GET /api/resume-versions
router.get("/", protect, getVersions);

// @route   GET /api/resume-versions/compare?versionA=...&versionB=...
router.get("/compare", protect, compareVersions);

// @route   GET /api/resume-versions/:id/download
router.get("/:id/download", protect, downloadVersion);

// @route   GET /api/resume-versions/:id
router.get("/:id", protect, getVersion);

// @route   POST /api/resume-versions
router.post("/", protect, createVersion);

// @route   PATCH /api/resume-versions/:id/restore
router.patch("/:id/restore", protect, restoreVersion);

// @route   DELETE /api/resume-versions/:id
router.delete("/:id", protect, deleteVersion);

module.exports = router;