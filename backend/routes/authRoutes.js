const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login and receive tokens
router.post("/login", login);

// @route   POST /api/auth/logout
// @desc    Revoke refresh token and clear cookie
router.post("/logout", logout);

// @route   POST /api/auth/refresh
// @desc    Exchange refresh token for new access token
router.post("/refresh", refreshToken);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get("/me", protect, getMe);

module.exports = router;