const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jobScanner = require('../services/jobScanner');

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
 * POST /api/scanner/run
 * Manually trigger a scan for the authenticated user.
 */
router.post('/run', verifyToken, async (req, res) => {
  try {
    const result = await jobScanner.runScanForUser(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('Scanner error:', err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

/**
 * GET /api/scanner/notifications
 * Retrieve all notifications for the authenticated user.
 */
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await jobScanner.getNotifications(req.user.id);
    res.json({ notifications });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/scanner/notifications/:id/read
 * Mark a notification as read.
 */
router.patch('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await jobScanner.markRead(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * GET /api/scanner/status
 * Return the latest scan summary for the user.
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const notifications = await jobScanner.getNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ unreadCount, totalNotifications: notifications.length });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Failed to get scanner status' });
  }
});

module.exports = router;