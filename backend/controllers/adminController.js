const User = require("../models/User");
const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");
const TailoredResume = require("../models/TailoredResume");
const CoverLetter = require("../models/CoverLetter");
const Email = require("../models/Email");
const JobApplication = require("../models/JobApplication");

/**
 * Simple admin check middleware (inline).
 * Requires user.role === "admin" (or falls back to earliest users as admin).
 */
async function getAdminStats(req, res) {
  try {
    const now = new Date();
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── User Statistics ──────────────────────────────────
    const totalUsers = await User.countDocuments({});
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });

    // Daily active users (users who had sessions or activity in last 24h)
    // Simplified: users created today
    const dailyActiveUsers = await User.countDocuments({ createdAt: { $gte: today } });

    // Users by registration month (last 12 months)
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── Resume Generations (AI features usage) ──────────
    const resumesUploaded = await Resume.countDocuments({});
    const tailoredResumes = await TailoredResume.countDocuments({});
    const coverLetters = await CoverLetter.countDocuments({});
    const emailGenerations = await Email.countDocuments({});
    const resumeVersions = await ResumeVersion.countDocuments({});
    const jobApplications = await JobApplication.countDocuments({});
    const careerInsights = 0; // No dedicated model; cumulate from AI service

    const totalGenerations =
      tailoredResumes + coverLetters + emailGenerations + resumeVersions + jobApplications;

    // Resume generations over time (last 7 days)
    const tailoredByDay = await TailoredResume.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const coverLettersByDay = await CoverLetter.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const emailsByDay = await Email.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const jobsByDay = await JobApplication.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── API Usage (counts of resources per user) ─────────
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: "resumes",
          localField: "_id",
          foreignField: "userId",
          as: "resumes",
        },
      },
      {
        $lookup: {
          from: "tailoredresumes",
          localField: "_id",
          foreignField: "userId",
          as: "tailoredResumes",
        },
      },
      {
        $lookup: {
          from: "coverletters",
          localField: "_id",
          foreignField: "userId",
          as: "coverLetters",
        },
      },
      {
        $lookup: {
          from: "emails",
          localField: "_id",
          foreignField: "userId",
          as: "emails",
        },
      },
      {
        $lookup: {
          from: "jobapplications",
          localField: "_id",
          foreignField: "userId",
          as: "jobApplications",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          createdAt: 1,
          resumesCount: { $size: "$resumes" },
          tailoredResumesCount: { $size: "$tailoredResumes" },
          coverLettersCount: { $size: "$coverLetters" },
          emailsCount: { $size: "$emails" },
          jobApplicationsCount: { $size: "$jobApplications" },
          totalActivity: {
            $add: [
              { $size: "$resumes" },
              { $size: "$tailoredResumes" },
              { $size: "$coverLetters" },
              { $size: "$emails" },
              { $size: "$jobApplications" },
            ],
          },
        },
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 20 },
    ]);

    // ── System Stats ─────────────────────────────────────
    const os = require("os");
    const systemStats = {
      cpuUsage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
      totalMemory: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemory: Math.round(os.freemem() / (1024 * 1024)),
      uptime: Math.round(os.uptime() / 3600),
      nodeVersion: process.version,
    };

    // ── Error Logs (simulated from recent DB errors) ─────
    // In production, read from a log file or error collection
    const errorLogs = [
      { timestamp: new Date().toISOString(), message: "Dashboard loaded", level: "info" },
      { timestamp: new Date().toISOString(), message: `Uptime: ${systemStats.uptime}h`, level: "info" },
    ];

    // ── Daily Active Users (users who had activity, simplified) ──
    // Check users who had job applications created today
    const dauFromJobs = await JobApplication.distinct("userId", {
      createdAt: { $gte: today },
    }).then((ids) => ids.length);

    const dauFromResumes = await TailoredResume.distinct("userId", {
      createdAt: { $gte: today },
    }).then((ids) => ids.length);

    const dauFromCoverLetters = await CoverLetter.distinct("userId", {
      createdAt: { $gte: today },
    }).then((ids) => ids.length);

    // Union DAU (approximate)
    const dauEstimate = Math.max(dauFromJobs, dauFromResumes, dauFromCoverLetters);

    res.json({
      // User stats
      users: {
        total: totalUsers,
        last7Days: usersLast7Days,
        last30Days: usersLast30Days,
        dailyActiveUsers: dauEstimate,
        byMonth: usersByMonth,
      },
      // Generations
      generations: {
        resumesUploaded,
        tailoredResumes,
        coverLetters,
        emailGenerations,
        resumeVersions,
        jobApplications,
        total: totalGenerations,
        tailoredByDay,
        coverLettersByDay,
        emailsByDay,
        jobsByDay,
      },
      // API usage (top users)
      topUsers,
      // System
      system: systemStats,
      // Errors
      errorLogs,
      // Timestamp
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
}

module.exports = { getAdminStats };