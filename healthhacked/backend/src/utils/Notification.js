
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
  },
  metadata: {
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthContext'
    },
    carePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarePlan'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: String,
    actionRequired: Boolean
  },
  userInteraction: {
    opened: {
      type: Boolean,
      default: false
    },
    openedAt: Date,
    clicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    responded: {
      type: Boolean,
      default: false
    },
    respondedAt: Date,
    response: String
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ 'delivery.scheduledFor': 1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for is overdue
notificationSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.delivery.scheduledFor < new Date();
});

// Instance method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.delivery.sentAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.delivery.deliveredAt = new Date();
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.delivery.errorMessage = errorMessage;
  this.delivery.attempts += 1;
  return this.save();
};

// Instance method to track user interaction
notificationSchema.methods.trackOpen = function() {
  this.userInteraction.opened = true;
  this.userInteraction.openedAt = new Date();
  return this.save();
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function() {
  return this.find({
    status: 'pending',
    'delivery.scheduledFor': { $lte: new Date() },
    'delivery.attempts': { $lt: this.schema.paths.delivery.schema.paths.maxAttempts.default }
  }).populate('userId', 'email profile.name preferences');
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-delivery.errorMessage');
};

module.exports = mongoose.model('Notification', notificationSchema);