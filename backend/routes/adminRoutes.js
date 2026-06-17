const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getAdminStats } = require("../controllers/adminController");

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @note    For now, any authenticated user can access (open for single-user dev mode)
router.get("/dashboard", protect, getAdminStats);

module.exports = router;