// ================================
// File: backend/src/jobs/cleanup.js
// ================================
const cron = require('cron');
const logger = require('../utils/logger');
const ChatHistory = require('../models/ChatHistory');
const Notification = require('../models/Notification');
const HealthContext = require('../models/HealthContext');

class CleanupJobs {
  constructor() {
    this.setupCleanupJobs();
  }

  setupCleanupJobs() {
    // Daily cleanup at 3 AM
    const dailyCleanup = new cron.CronJob('0 3 * * *', async () => {
      await this.performDailyCleanup();
    });

    // Weekly deep cleanup on Sundays at 4 AM
    const weeklyCleanup = new cron.CronJob('0 4 * * 0', async () => {
      await this.performWeeklyCleanup();
    });

    dailyCleanup.start();
    weeklyCleanup.start();

    logger.info('🧹 Cleanup jobs initialized');
  }

  async performDailyCleanup() {
    try {
      logger.info('Starting daily cleanup...');

      // Clean up old failed notifications (older than 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const failedNotifications = await Notification.deleteMany({
        status: 'failed',
        createdAt: { $lt: sevenDaysAgo }
      });

      // Clean up old delivered notifications (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldNotifications = await Notification.deleteMany({
        status: { $in: ['sent', 'delivered'] },
        createdAt: { $lt: thirtyDaysAgo }
      });

      // Clean up inactive chat sessions (older than 60 days)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const inactiveSessions = await ChatHistory.deleteMany({
        'summary.lastActivity': { $lt: sixtyDaysAgo },
        isActive: false
      });

      logger.info('Daily cleanup completed', {
        failedNotificationsDeleted: failedNotifications.deletedCount,
        oldNotificationsDeleted: oldNotifications.deletedCount,
        inactiveSessionsDeleted: inactiveSessions.deletedCount
      });

    } catch (error) {
      logger.error('Error during daily cleanup:', error);
    }
  }

  async performWeeklyCleanup() {
    try {
      logger.info('Starting weekly cleanup...');

      // Archive resolved health contexts older than 90 days
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const resolvedContexts = await HealthContext.updateMany({
        status: 'resolved',
        resolvedAt: { $lt: ninetyDaysAgo }
      }, {
        $set: { isArchived: true }
      });

      // Clean up empty chat histories
      const emptyChatHistories = await ChatHistory.deleteMany({
        $or: [
          { messages: { $size: 0 } },
          { messages: { $exists: false } }
        ]
      });

      // Log database statistics
      const stats = await this.getDatabaseStats();

      logger.info('Weekly cleanup completed', {
        archivedContexts: resolvedContexts.modifiedCount,
        emptyChatHistoriesDeleted: emptyChatHistories.deletedCount,
        databaseStats: stats
      });

    } catch (error) {
      logger.error('Error during weekly cleanup:', error);
    }
  }

  async getDatabaseStats() {
    try {
      const User = require('../models/User');
      const CarePlan = require('../models/CarePlan');

      const stats = {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        totalHealthContexts: await HealthContext.countDocuments(),
        activeHealthContexts: await HealthContext.countDocuments({ status: 'active' }),
        totalChatSessions: await ChatHistory.countDocuments(),
        activeChatSessions: await ChatHistory.countDocuments({ isActive: true }),
        totalCarePlans: await CarePlan.countDocuments(),
        activeCarePlans: await CarePlan.countDocuments({ isActive: true }),
        totalNotifications: await Notification.countDocuments(),
        pendingNotifications: await Notification.countDocuments({ status: 'pending' })
      };

      return stats;

    } catch (error) {
      logger.error('Error getting database stats:', error);
      return null;
    }
  }
}

module.exports = new CleanupJobs();
