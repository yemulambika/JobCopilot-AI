const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");

// ─── Helpers ───────────────────────────────────────────────

const REFRESH_COOKIE = "refreshToken";
const REFRESH_DAYS = 7;

function sendTokens(res, user, accessToken) {
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
  });

  // Also save on user document for quick lookup
  user.refreshToken = refreshToken;
  user.save({ validateModifiedOnly: true });

  // Set refresh token as httpOnly cookie
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
    },
  });
}

// ─── Register ──────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    const accessToken = user.generateAccessToken();
    sendTokens(res, user, accessToken);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// ─── Login ─────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Revoke any previous refresh tokens for this user
    await RefreshToken.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true }
    );

    const accessToken = user.generateAccessToken();
    sendTokens(res, user, accessToken);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ─── Refresh Token ─────────────────────────────────────────

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }

    // Verify the JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Find in DB and check not revoked
    const storedToken = await RefreshToken.findOne({
      user: decoded.id,
      token,
      isRevoked: false,
    });

    if (!storedToken) {
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Revoke old refresh token (rotate)
    storedToken.isRevoked = true;
    await storedToken.save();

    // Issue new pair
    const accessToken = user.generateAccessToken();
    sendTokens(res, user, accessToken);
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
};

// ─── Logout ────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      await RefreshToken.updateMany({ token }, { isRevoked: true });
    }

    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

// ─── Get Current User ──────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};