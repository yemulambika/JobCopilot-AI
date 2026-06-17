const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById, updateUserProfile, getUserResumes, saveUserResume, getJobHistory, saveJobHistory } = require('../services/userService');

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

// GET profile
router.get('/profile', verifyToken, async (req, res) => {
  const profile = await getUserById(req.user.id);
  res.json({ profile });
});

// POST profile update
router.post('/profile', verifyToken, async (req, res) => {
  const updated = await updateUserProfile(req.user.id, req.body);
  res.json({ success: true, profile: updated });
});

// GET resumes
router.get('/resumes', verifyToken, async (req, res) => {
  const resumes = await getUserResumes(req.user.id);
  res.json({ resumes });
});

// POST new resume
router.post('/resumes', verifyToken, async (req, res) => {
  const saved = await saveUserResume(req.user.id, req.body);
  res.json({ success: true, resume: saved });
});

// GET job history
router.get('/jobs', verifyToken, async (req, res) => {
  const history = await getJobHistory(req.user.id);
  res.json({ history });
});

// POST job history entry
router.post('/jobs', verifyToken, async (req, res) => {
  const entry = await saveJobHistory(req.user.id, req.body);
  res.json({ success: true, entry });
});

module.exports = router;