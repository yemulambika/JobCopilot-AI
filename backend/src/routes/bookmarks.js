const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In‑memory store for demo purposes
// In a real app replace with a DB model
const userBookmarks = {}; // { userId: [ { id, company, role, url, notes, tags } ] }

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

// GET all saved jobs for the user
router.get('/', verifyToken, (req, res) => {
  const list = userBookmarks[req.user.id] || [];
  res.json({ bookmarks: list });
});

// POST a new saved job
router.post('/', verifyToken, (req, res) => {
  const { company, role, url, notes, tags } = req.body;
  if (!company || !role || !url) {
    return res.status(400).json({ error: 'company, role and url are required' });
  }
  const newJob = {
    id: Date.now().toString(),
    company,
    role,
    url,
    notes: notes || '',
    tags: tags || [],
  };
  if (!userBookmarks[req.user.id]) userBookmarks[req.user.id] = [];
  userBookmarks[req.user.id].push(newJob);
  res.json({ success: true, job: newJob });
});

// PUT update notes/tags for a saved job
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { notes, tags } = req.body;
  const list = userBookmarks[req.user.id] || [];
  const job = list.find((j) => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (notes !== undefined) job.notes = notes;
  if (tags !== undefined) job.tags = tags;
  res.json({ success: true, job });
});

// DELETE a saved job
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const list = userBookmarks[req.user.id] || [];
  const index = list.findIndex((j) => j.id === id);
  if (index === -1) return res.status(404).json({ error: 'Job not found' });
  list.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;