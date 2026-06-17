const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['email', 'in-app', 'browser'], default: 'in-app' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    read: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);