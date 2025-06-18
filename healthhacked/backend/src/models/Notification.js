const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['care_reminder', 'follow_up', 'medication_reminder', 'appointment_reminder', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  delivery: {
    method: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'email'
    },
    scheduledFor: {
      type: Date,
      default: Date.now
    },
    sentAt: Date,
    deliveredAt: Date,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    errorMessage: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);