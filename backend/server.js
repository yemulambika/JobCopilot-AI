const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// Debug: show what env vars Render is loading
console.log("ENV DEBUG:", {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});

const connectDB = require("./config/db");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const tailorRoutes = require("./routes/tailorRoutes");
const coverLetterRoutes = require("./routes/coverLetterRoutes");
const emailRoutes = require("./routes/emailRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const exportRoutes = require("./routes/exportRoutes");
const jobTrackerRoutes = require("./routes/jobTrackerRoutes");
const extensionRoutes = require("./routes/extensionRoutes");
const resumeVersionRoutes = require("./routes/resumeVersionRoutes");
const careerInsightsRoutes = require("./routes/careerInsightsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mockInterviewRoutes = require("./routes/mockInterviewRoutes");
const learningRoadmapRoutes = require("./routes/learningRoadmapRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: [
      "https://ai-resume-maker-ashen.vercel.app",  // Frontend URL
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Connect to MongoDB ---
connectDB();

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tailor", tailorRoutes);
app.use("/api/cover-letters", coverLetterRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/jobs", jobTrackerRoutes);
app.use("/api/extension", extensionRoutes);
app.use("/api/resume-versions", resumeVersionRoutes);
app.use("/api/career-insights", careerInsightsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mock-interview", mockInterviewRoutes);
app.use("/api", resumeRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;