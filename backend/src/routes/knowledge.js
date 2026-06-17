const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In‑memory store for demo (replace with DB in production)
const userKB = {}; // { userId: [{ id, type, content, metadata }] }

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

// GET all knowledge items
router.get('/', verifyToken, (req, res) => {
  const items = userKB[req.user.id] || [];
  res.json({ items });
});

// POST a new knowledge item
router.post('/', verifyToken, (req, res) => {
  const { type, content, metadata } = req.body;
  if (!type || !content) {
    return res.status(400).json({ error: 'type and content required' });
  }
  const newItem = {
    id: Date.now().toString(),
    type,
    content,
    metadata: metadata || {},
  };
  if (!userKB[req.user.id]) userKB[req.user.id] = [];
  userKB[req.user.id].push(newItem);
  res.json({ success: true, item: newItem });
});

// DELETE an item
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const list = userKB[req.user.id] || [];
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Item not found' });
  list.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;