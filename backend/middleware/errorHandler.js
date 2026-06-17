/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error("Error:", err.message);

  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};

module.exports = { notFound, errorHandler };