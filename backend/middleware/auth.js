const jwt = require("jsonwebtoken");

/**
 * JWT Authentication middleware
 * Verifies the access token from the Authorization header.
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", expired: true });
    }

    res.status(401).json({ error: "Not authorized, token invalid" });
  }
};

/**
 * Optional auth — attaches user if token is valid, but does not block.
 */
const optionalAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // silently ignore invalid token
  }

  next();
};

module.exports = { protect, optionalAuth };
