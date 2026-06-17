/**
 * Daily Job Scanner
 *
 * Scans only jobs already stored in the database (imported via browser extension or manual import).
 * Does NOT visit external job sites.
 *
 * For each new job (created after the last scan), recalculates ATS score using the
 * user's stored resume text (if available). If ATS >= 85, creates a notification.
 */

const Job = require('../models/Job');
const Resume = require('../../models/Resume');
const Notification = require('../models/Notification');
const User = require('../../models/User');

/** In‑memory last‑scan timestamp string keyed by userId. */
const lastScanTimestamps = {};

/**
 * Simple non‑ML ATS score based on word overlap between resume and job description.
 * Heuristic, not production‑grade.
 */
function atsScore(resumeText, jdText) {
  if (!resumeText || !jdText) return 0;
  const resumeTokens = new Set(
    resumeText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  );
  const jdTokens = new Set(
    jdText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  );
  if (jdTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of jdTokens) {
    if (resumeTokens.has(token)) overlap++;
  }
  return Math.round((overlap / jdTokens.size) * 100);
}

/**
 * Run a scan for a given user.
 */
async function runScanForUser(userId) {
  const lastScan = lastScanTimestamps[userId] || new Date(0);

  const newJobs = await Job.find({
    createdAt: { $gt: lastScan },
  }).sort({ createdAt: -1 });

  if (!newJobs.length) {
    return { scannedCount: 0, notifiedCount: 0 };
  }

  const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
  const resumeText = resume ? resume.extractedText || '' : '';

  let notifiedCount = 0;

  for (const job of newJobs) {
    const score = atsScore(resumeText, job.jd || '');
    if (score >= 85) {
      await Notification.create({
        userId,
        type: 'in-app',
        title: 'High‑match job found!',
        message: `"${job.title}" at ${job.company} scores ${score}% ATS.`,
        jobs: [job._id],
      });
      notifiedCount++;
    }
  }

  lastScanTimestamps[userId] = new Date();

  return { scannedCount: newJobs.length, notifiedCount };
}

/**
 * Run scan for all users.
 */
async function runScanForAllUsers() {
  const users = await User.find({});
  let totalScanned = 0;
  let totalNotified = 0;

  for (const user of users) {
    const result = await runScanForUser(user._id.toString());
    totalScanned += result.scannedCount;
    totalNotified += result.notifiedCount;
  }

  return { totalScanned, totalNotified };
}

/**
 * Get all notifications for a user.
 */
async function getNotifications(userId) {
  return Notification.find({ userId }).sort({ sentAt: -1 });
}

/**
 * Mark a notification as read.
 */
async function markRead(notificationId) {
  return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
}

module.exports = { runScanForUser, runScanForAllUsers, getNotifications, markRead };