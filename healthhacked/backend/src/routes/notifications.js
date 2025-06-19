
const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const NotificationService = require('../services/external/notificationService');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Apply protection to all notification routes
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, status, type } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark notifications as opened
    await Notification.updateMany(
      { userId, 'userInteraction.opened': false },
      { 
        'userInteraction.opened': true,
        'userInteraction.openedAt': new Date()
      }
    );

    res.json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadCount = await Notification.countDocuments({
      userId,
      'userInteraction.opened': false
    });

    res.json({
      success: true,
      data: {
        stats,
        unreadCount
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/:id/interact
// @desc    Mark notification as clicked/responded
// @access  Private
router.put('/:id/interact', async (req, res, next) => {
  try {
    const { action, response } = req.body; // action: 'click' or 'respond'
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this notification', 403));
    }

    // Update interaction based on action
    if (action === 'click') {
      notification.userInteraction.clicked = true;
      notification.userInteraction.clickedAt = new Date();
    } else if (action === 'respond') {
      notification.userInteraction.responded = true;
      notification.userInteraction.respondedAt = new Date();
      notification.userInteraction.response = response;
    }

    await notification.save();

    logger.info('Notification interaction tracked', {
      userId: req.user._id,
      notificationId,
      action
    });

    res.json({
      success: true,
      message: 'Interaction recorded'
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.post('/preferences', async (req, res, next) => {
  try {
    const { emailNotifications, notificationTime, followUpFrequency } = req.body;
    const User = require('../models/User');
    
    const user = await User.findById(req.user._id);

    // Update preferences
    if (typeof emailNotifications === 'boolean') {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (notificationTime) {
      user.preferences.notificationTime = notificationTime;
    }
    if (followUpFrequency) {
      user.preferences.followUpFrequency = followUpFrequency;
    }

    await user.save();

    // Update notification scheduling
    if (emailNotifications) {
      await NotificationService.scheduleFollowUpNotifications(user._id);
    } else {
      await NotificationService.cancelUserNotifications(user._id);
    }

    logger.info('Notification preferences updated', { userId: req.user._id });

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/unsubscribe
// @desc    Unsubscribe from email notifications (public link)
// @access  Public
router.get('/unsubscribe', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return next(new AppError('Unsubscribe token is required', 400));
    }

    const User = require('../models/User');
    const user = await User.findById(token);

    if (!user) {
      return next(new AppError('Invalid unsubscribe token', 400));
    }

    // Disable email notifications
    user.preferences.emailNotifications = false;
    await user.save();

    // Cancel scheduled notifications
    await NotificationService.cancelUserNotifications(user._id);

    logger.info('User unsubscribed from email notifications', { userId: user._id });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - HealthHacked</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { color: #48bb78; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from HealthHacked email notifications.</p>
          <p>You can re-enable notifications anytime from your account settings.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Return to HealthHacked</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Verify user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to delete this notification', 403));
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/test
// @desc    Send test notification (development only)
// @access  Private
router.post('/test', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next(new AppError('Test notifications not available in production', 403));
  }

  try {
    const { type = 'care_reminder', message = 'This is a test notification' } = req.body;

    await NotificationService.notificationQueue.add('test-notification', {
      userId: req.user._id.toString(),
      type,
      message
    });

    res.json({
      success: true,
      message: 'Test notification queued'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;