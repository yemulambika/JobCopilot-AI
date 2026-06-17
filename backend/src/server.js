const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const syncRouter = require('./routes/sync');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount sync API under /api/sync
app.use('/api/sync', syncRouter);
const bookmarksRouter = require('./routes/bookmarks');
const jobCollectorRouter = require('./routes/jobCollector');
const knowledgeRouter = require('./routes/knowledge');
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/jobs', jobCollectorRouter);
app.use('/api/knowledge', knowledgeRouter);
const scannerRouter = require('./routes/scanner');
const jobScanner = require('./services/jobScanner');
app.use('/api/scanner', scannerRouter);

// Run scanner every 6 hours (21600000 ms)
setInterval(() => {
  console.log('[Scanner] Running periodic scan...');
  jobScanner.runScanForAllUsers().then((r) => {
    console.log(`[Scanner] Done – scanned ${r.totalScanned}, notified ${r.totalNotified}`);
  }).catch((e) => console.error('[Scanner] Error:', e));
}, 6 * 60 * 60 * 1000);

// Simple health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});