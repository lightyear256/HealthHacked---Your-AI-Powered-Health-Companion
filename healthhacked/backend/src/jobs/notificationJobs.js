
const cron = require('cron');
const HealthContext = require('../models/HealthContext');
const CarePlan = require('../models/CarePlan');
const NotificationService = require('../services/external/notificationService');
const logger = require('../utils/logger');

class NotificationJobs {
  constructor() {
    this.jobs = [];
    this.setupCronJobs();
  }

  setupCronJobs() {
    // Daily check for users needing follow-up (runs every hour)
    const followUpJob = new cron.CronJob('0 * * * *', async () => {
      await this.processFollowUpReminders();
    });

    // Daily care plan reminders (runs every 2 hours)
    const carePlanJob = new cron.CronJob('0 */2 * * *', async () => {
      await this.processCarePlanReminders();
    });

    // Cleanup old notifications (runs daily at 2 AM)
    const cleanupJob = new cron.CronJob('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    // Start all jobs
    followUpJob.start();
    carePlanJob.start();
    cleanupJob.start();

    this.jobs = [followUpJob, carePlanJob, cleanupJob];
    
    logger.info('📅 Notification cron jobs initialized');
  }

  async processFollowUpReminders() {
    try {
      // Find health contexts that need follow-up
      const contextsNeedingFollowUp = await HealthContext.findNeedingFollowUp();
      
      logger.info('Processing follow-up reminders', { 
        count: contextsNeedingFollowUp.length 
      });

      for (const context of contextsNeedingFollowUp) {
        if (context.userId.preferences.emailNotifications) {
          await NotificationService.notificationQueue.add('followup-reminder', {
            userId: context.userId._id.toString(),
            contextId: context._id.toString()
          }, {
            attempts: 3,
            backoff: 'exponential',
            delay: Math.random() * 60000 // Random delay up to 1 minute
          });

          // Update next follow-up date
          context.followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          await context.save();
        }
      }

    } catch (error) {
      logger.error('Error processing follow-up reminders:', error);
    }
  }

  async processCarePlanReminders() {
    try {
      // Find care plans that need reminders
      const carePlansNeedingReminders = await CarePlan.findNeedingFollowUp();
      
      logger.info('Processing care plan reminders', { 
        count: carePlansNeedingReminders.length 
      });

      for (const carePlan of carePlansNeedingReminders) {
        if (carePlan.userId.preferences.emailNotifications) {
          await NotificationService.notificationQueue.add('careplan-reminder', {
            userId: carePlan.userId._id.toString(),
            carePlanId: carePlan._id.toString()
          }, {
            attempts: 3,
            backoff: 'exponential',
            delay: Math.random() * 60000 // Random delay up to 1 minute
          });

          // Update next follow-up date
          carePlan.nextFollowUp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          carePlan.lastNotificationSent = new Date();
          await carePlan.save();
        }
      }

    } catch (error) {
      logger.error('Error processing care plan reminders:', error);
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Remove old notifications
      const Notification = require('../models/Notification');
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['sent', 'delivered', 'failed'] }
      });

      // Clean up old chat history
      const ContextManager = require('../services/core/contextManager');
      const deletedSessions = await ContextManager.cleanupOldSessions(30);

      logger.info('Cleanup completed', {
        notificationsDeleted: result.deletedCount,
        sessionsDeleted: deletedSessions
      });

    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  async scheduleUserSpecificNotifications() {
    try {
      
      const User = require('../models/User');
      const activeUsers = await User.find({
        isActive: true,
        'preferences.emailNotifications': true
      });

      for (const user of activeUsers) {
        await NotificationService.scheduleFollowUpNotifications(user._id);
      }

      logger.info('User-specific notifications rescheduled', {
        userCount: activeUsers.length
      });

    } catch (error) {
      logger.error('Error scheduling user-specific notifications:', error);
    }
  }

  stopAllJobs() {
    this.jobs.forEach(job => job.stop());
    logger.info('All notification jobs stopped')}}