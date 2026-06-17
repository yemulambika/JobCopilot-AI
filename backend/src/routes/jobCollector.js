const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/**
 * POST /api/jobs
 * Add a new job entry. Deduplication is performed using:
 *   - URL (unique index)
 *   - company+title+location (compound unique index)
 */
router.post('/', verifyToken, async (req, res) => {
  const {
    title,
    company,
    location,
    source,
    jd,
    url,
    salary,
    employmentType,
    postedDate,
  } = req.body;

  if (!title || !company || !location || !source || !jd || !url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Attempt to create; if duplicate key error, treat as success (already stored)
    const job = await Job.create({
      title,
      company,
      location,
      source,
      jd,
      url,
      salary,
      employmentType,
      postedDate,
    });
    res.json({ success: true, job });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key – fetch existing record
      const existing = await Job.findOne({
        $or: [
          { url },
          { company, title, location },
        ],
      });
      return res.json({ success: true, job: existing, duplicate: true });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/jobs
 * Return all jobs for the authenticated user.
 * (In this demo we ignore user scoping – all jobs are global.)
 */
router.get('/', verifyToken, async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json({ jobs });
});

module.exports = router;