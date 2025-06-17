// ================================
// File: backend/src/services/external/notificationService.js
// ================================
const nodemailer = require('nodemailer');
const Bull = require('bull');
const Redis = require('redis');
const config = require('../../config');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const SecondaryChatbot = require('../ai/secondaryChatbot');

class NotificationService {
  constructor() {
    this.transporter = this.createEmailTransporter();
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect().catch(console.error);
    
    // Create notification queue
    this.notificationQueue = new Bull('notification queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });
    
    this.setupQueueProcessors();
    logger.info('📧 Notification Service initialized');
  }

  createEmailTransporter() {
    if (!config.email.host || !config.email.user || !config.email.pass) {
      logger.warn('Email configuration incomplete - email notifications disabled');
      return null;
    }

    return nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  setupQueueProcessors() {
    // Process daily care check-ins
    this.notificationQueue.process('daily-checkin', async (job) => {
      const { userId } = job.data;
      await this.sendDailyCareEmail(userId);
    });

    // Process follow-up reminders
    this.notificationQueue.process('followup-reminder', async (job) => {
      const { userId, contextId } = job.data;
      await this.sendFollowUpReminder(userId, contextId);
    });

    // Process care plan reminders
    this.notificationQueue.process('careplan-reminder', async (job) => {
      const { userId, carePlanId } = job.data;
      await this.sendCarePlanReminder(userId, carePlanId);
    });

    // Process emergency notifications
    this.notificationQueue.process('emergency-alert', async (job) => {
      const { userId, message, urgency } = job.data;
      await this.sendEmergencyAlert(userId, message, urgency);
    });

    logger.info('📋 Notification queue processors initialized');
  }

  async scheduleFollowUpNotifications(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailNotifications) {
        return null;
      }

      const intervalHours = config.notifications.intervalHours;
      const notificationTime = user.preferences.notificationTime || config.notifications.defaultTime;
      
      // Parse notification time (e.g., "09:00")
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Calculate next notification time
      const now = new Date();
      const nextNotification = new Date();
      nextNotification.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      // Schedule recurring job
      const job = await this.notificationQueue.add('daily-checkin', {
        userId: userId.toString(),
        type: 'care_message'
      }, {
        repeat: { 
          cron: `${minutes} ${hours} * * *` // Daily at specified time
        },
        removeOnComplete: 10,
        removeOnFail: 5
      });

      logger.info('Follow-up notifications scheduled', {
        userId,
        nextNotification,
        intervalHours,
        jobId: job.id
      });

      return job;

    } catch (error) {
      logger.error('Error scheduling follow-up notifications:', error);
      throw error;
    }
  }

  async sendDailyCareEmail(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailNotifications) {
        logger.info('User notifications disabled or user not found', { userId });
        return;
      }

      // Generate personalized care message
      const careContent = await SecondaryChatbot.generateDailyCareMessage(userId);
      
      if (!careContent) {
        logger.info('No active health context for daily care message', { userId });
        return;
      }

      // Create email content
      const emailContent = this.createCareEmailTemplate(user, careContent);
      
      // Send email
      const emailResult = await this.sendEmail({
        to: user.email,
        subject: careContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      // Store notification record
      await this.createNotificationRecord(userId, {
        type: 'care_reminder',
        title: careContent.subject,
        message: careContent.message,
        status: emailResult.success ? 'sent' : 'failed',
        delivery: {
          method: 'email',
          sentAt: emailResult.success ? new Date() : null,
          errorMessage: emailResult.error || null
        },
        metadata: {
          contextId: careContent.contextId,
          priority: 'medium',
          category: 'daily_care'
        }
      });

      logger.info('Daily care email sent', {
        userId,
        success: emailResult.success,
        contextId: careContent.contextId
      });

    } catch (error) {
      logger.error('Error sending daily care email:', error);
    }
  }

  async sendFollowUpReminder(userId, contextId) {
    try {
      const user = await User.findById(userId);
      const HealthContext = require('../../models/HealthContext');
      const healthContext = await HealthContext.findById(contextId);

      if (!user || !healthContext || !user.preferences.emailNotifications) {
        return;
      }

      const emailContent = this.createFollowUpEmailTemplate(user, healthContext);
      
      const emailResult = await this.sendEmail({
        to: user.email,
        subject: `HealthHacked: How are you feeling with your ${healthContext.primaryConcern}?`,
        html: emailContent.html,
        text: emailContent.text
      });

      await this.createNotificationRecord(userId, {
        type: 'follow_up',
        title: 'Follow-up Check-in',
        message: `How are you feeling with your ${healthContext.primaryConcern}?`,
        status: emailResult.success ? 'sent' : 'failed',
        delivery: {
          method: 'email',
          sentAt: emailResult.success ? new Date() : null,
          errorMessage: emailResult.error || null
        },
        metadata: {
          contextId,
          priority: 'medium',
          category: 'follow_up'
        }
      });

      logger.info('Follow-up reminder sent', { userId, contextId, success: emailResult.success });

    } catch (error) {
      logger.error('Error sending follow-up reminder:', error);
    }
  }

  async sendCarePlanReminder(userId, carePlanId) {
    try {
      const user = await User.findById(userId);
      const CarePlan = require('../../models/CarePlan');
      const carePlan = await CarePlan.findById(carePlanId).populate('contextId');

      if (!user || !carePlan || !user.preferences.emailNotifications) {
        return;
      }

      // Get incomplete recommendations
      const incompleteRecommendations = carePlan.recommendations.filter(rec => !rec.completed);
      
      if (incompleteRecommendations.length === 0) {
        logger.info('All care plan recommendations completed', { userId, carePlanId });
        return;
      }

      const emailContent = this.createCarePlanEmailTemplate(user, carePlan, incompleteRecommendations);
      
      const emailResult = await this.sendEmail({
        to: user.email,
        subject: `HealthHacked: Your Care Plan Reminder`,
        html: emailContent.html,
        text: emailContent.text
      });

      await this.createNotificationRecord(userId, {
        type: 'care_reminder',
        title: 'Care Plan Reminder',
        message: `You have ${incompleteRecommendations.length} pending care recommendations`,
        status: emailResult.success ? 'sent' : 'failed',
        delivery: {
          method: 'email',
          sentAt: emailResult.success ? new Date() : null,
          errorMessage: emailResult.error || null
        },
        metadata: {
          carePlanId,
          contextId: carePlan.contextId._id,
          priority: 'medium',
          category: 'care_plan'
        }
      });

      logger.info('Care plan reminder sent', { userId, carePlanId, success: emailResult.success });

    } catch (error) {
      logger.error('Error sending care plan reminder:', error);
    }
  }

  async sendEmergencyAlert(userId, message, urgency = 'high') {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const emailContent = this.createEmergencyEmailTemplate(user, message, urgency);
      
      const emailResult = await this.sendEmail({
        to: user.email,
        subject: '🚨 HealthHacked: Immediate Attention Required',
        html: emailContent.html,
        text: emailContent.text,
        priority: 'high'
      });

      await this.createNotificationRecord(userId, {
        type: 'system',
        title: 'Emergency Alert',
        message: message,
        status: emailResult.success ? 'sent' : 'failed',
        delivery: {
          method: 'email',
          sentAt: emailResult.success ? new Date() : null,
          errorMessage: emailResult.error || null
        },
        metadata: {
          priority: 'urgent',
          category: 'emergency',
          actionRequired: true
        }
      });

      logger.warn('Emergency alert sent', { userId, urgency, success: emailResult.success });

    } catch (error) {
      logger.error('Error sending emergency alert:', error);
    }
  }

  async sendEmail({ to, subject, html, text, priority = 'normal' }) {
    if (!this.transporter) {
      logger.warn('Email transporter not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
        text,
        priority: priority === 'high' ? 'high' : 'normal'
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Email sending failed:', {
        to,
        subject,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  createCareEmailTemplate(user, careContent) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🌟 HealthHacked Care Check-in</h2>
                <p>Hi ${user.profile.name}!</p>
            </div>
            <div class="content">
                <p>${careContent.message}</p>
                
                <p>I'm here to support you on your health journey. Click below to share an update:</p>
                
                <a href="${config.server.apiUrl.replace('/api', '')}/chat?context=${careContent.contextId}" class="cta-button">
                    ${careContent.cta || 'Share Update'}
                </a>
                
                <p><small>Remember, I'm here to provide support and information, but always consult with healthcare professionals for medical advice.</small></p>
            </div>
            <div class="footer">
                <p>HealthHacked - Your AI Health Companion</p>
                <p><a href="${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}">Unsubscribe</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
HealthHacked Care Check-in

Hi ${user.profile.name}!

${careContent.message}

I'm here to support you on your health journey. Visit ${config.server.apiUrl.replace('/api', '')}/chat?context=${careContent.contextId} to share an update.

Remember, I'm here to provide support and information, but always consult with healthcare professionals for medical advice.

---
HealthHacked - Your AI Health Companion
Unsubscribe: ${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}
    `;

    return { html, text };
  }

  createFollowUpEmailTemplate(user, healthContext) {
    const daysSince = Math.ceil((new Date() - healthContext.createdAt) / (1000 * 60 * 60 * 24));
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .progress-bar { background: #e2e8f0; border-radius: 10px; height: 8px; margin: 10px 0; }
            .progress-fill { background: #48bb78; height: 100%; border-radius: 10px; width: 60%; }
            .cta-button { background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>💚 Follow-up Check-in</h2>
                <p>Hi ${user.profile.name}!</p>
            </div>
            <div class="content">
                <p>It's been ${daysSince} day${daysSince !== 1 ? 's' : ''} since you mentioned your concern about <strong>${healthContext.primaryConcern}</strong>.</p>
                
                <p>How are you feeling now? I'd love to hear about your progress.</p>
                
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p><small>Your health journey progress</small></p>
                
                <a href="${config.server.apiUrl.replace('/api', '')}/chat?context=${healthContext._id}" class="cta-button">
                    Share Your Update
                </a>
                
                <p>Whether you're feeling better, the same, or have new concerns, I'm here to help guide you through your health journey.</p>
            </div>
            <div class="footer">
                <p>HealthHacked - Your AI Health Companion</p>
                <p><a href="${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}">Unsubscribe</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
HealthHacked Follow-up Check-in

Hi ${user.profile.name}!

It's been ${daysSince} day${daysSince !== 1 ? 's' : ''} since you mentioned your concern about ${healthContext.primaryConcern}.

How are you feeling now? I'd love to hear about your progress.

Visit ${config.server.apiUrl.replace('/api', '')}/chat?context=${healthContext._id} to share your update.

Whether you're feeling better, the same, or have new concerns, I'm here to help guide you through your health journey.

---
HealthHacked - Your AI Health Companion
Unsubscribe: ${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}
    `;

    return { html, text };
  }

  createCarePlanEmailTemplate(user, carePlan, incompleteRecommendations) {
    const completionPercentage = carePlan.progress.completionPercentage;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .recommendation { background: white; margin: 10px 0; padding: 15px; border-left: 4px solid #ed8936; border-radius: 4px; }
            .progress-bar { background: #e2e8f0; border-radius: 10px; height: 8px; margin: 10px 0; }
            .progress-fill { background: #ed8936; height: 100%; border-radius: 10px; width: ${completionPercentage}%; }
            .cta-button { background: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📋 Care Plan Reminder</h2>
                <p>Hi ${user.profile.name}!</p>
            </div>
            <div class="content">
                <p>You have some pending recommendations in your care plan for <strong>${carePlan.contextId.primaryConcern}</strong>.</p>
                
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p><small>${completionPercentage}% completed</small></p>
                
                <h3>Pending Recommendations:</h3>
                ${incompleteRecommendations.slice(0, 3).map(rec => `
                    <div class="recommendation">
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                    </div>
                `).join('')}
                
                ${incompleteRecommendations.length > 3 ? `<p><em>And ${incompleteRecommendations.length - 3} more...</em></p>` : ''}
                
                <a href="${config.server.apiUrl.replace('/api', '')}/dashboard/care-plan/${carePlan._id}" class="cta-button">
                    View Full Care Plan
                </a>
                
                <p>Taking small steps each day can lead to significant improvements in your health.</p>
            </div>
            <div class="footer">
                <p>HealthHacked - Your AI Health Companion</p>
                <p><a href="${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}">Unsubscribe</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
HealthHacked Care Plan Reminder

Hi ${user.profile.name}!

You have some pending recommendations in your care plan for ${carePlan.contextId.primaryConcern}.

Progress: ${completionPercentage}% completed

Pending Recommendations:
${incompleteRecommendations.slice(0, 3).map(rec => `• ${rec.title}: ${rec.description}`).join('\n')}

${incompleteRecommendations.length > 3 ? `And ${incompleteRecommendations.length - 3} more...` : ''}

View your full care plan: ${config.server.apiUrl.replace('/api', '')}/dashboard/care-plan/${carePlan._id}

Taking small steps each day can lead to significant improvements in your health.

---
HealthHacked - Your AI Health Companion
Unsubscribe: ${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}
    `;

    return { html, text };
  }

  createEmergencyEmailTemplate(user, message, urgency) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #fff5f5; padding: 20px; border: 2px solid #fed7d7; border-radius: 0 0 8px 8px; }
            .emergency-box { background: #feb2b2; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center; }
            .cta-button { background: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🚨 URGENT: Immediate Attention Required</h2>
                <p>Hi ${user.profile.name}</p>
            </div>
            <div class="content">
                <div class="emergency-box">
                    <h3>⚠️ Emergency Situation Detected</h3>
                </div>
                
                <p><strong>${message}</strong></p>
                
                <p>If this is a medical emergency:</p>
                <ul>
                    <li><strong>Call 911 immediately</strong></li>
                    <li>Go to your nearest emergency room</li>
                    <li>Contact your healthcare provider</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="tel:911" class="cta-button">📞 CALL 911</a>
                </div>
                
                <p><strong>Do not wait. Your safety is the top priority.</strong></p>
                
                <p><small>This alert was generated based on keywords detected in your health conversation. If this is not an emergency, please disregard this message.</small></p>
            </div>
            <div class="footer">
                <p>HealthHacked Emergency Alert System</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
🚨 HEALTHHACKED EMERGENCY ALERT 🚨

Hi ${user.profile.name},

URGENT: Immediate Attention Required

${message}

If this is a medical emergency:
• CALL 911 IMMEDIATELY
• Go to your nearest emergency room
• Contact your healthcare provider

DO NOT WAIT. Your safety is the top priority.

This alert was generated based on keywords detected in your health conversation. If this is not an emergency, please disregard this message.

---
HealthHacked Emergency Alert System
    `;

    return { html, text };
  }

  async createNotificationRecord(userId, notificationData) {
    try {
      const notification = new Notification({
        userId,
        ...notificationData
      });

      await notification.save();
      return notification;

    } catch (error) {
      logger.error('Error creating notification record:', error);
      throw error;
    }
  }

  async cancelUserNotifications(userId) {
    try {
      // Remove scheduled jobs for this user
      const jobs = await this.notificationQueue.getJobs(['waiting', 'delayed']);
      const userJobs = jobs.filter(job => job.data.userId === userId.toString());
      
      await Promise.all(userJobs.map(job => job.remove()));
      
      logger.info('User notifications cancelled', { userId, jobsRemoved: userJobs.length });
      
      return userJobs.length;

    } catch (error) {
      logger.error('Error cancelling user notifications:', error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const waiting = await this.notificationQueue.getWaiting();
      const active = await this.notificationQueue.getActive();
      const completed = await this.notificationQueue.getCompleted();
      const failed = await this.notificationQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };

    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return null;
    }
  }
}

module.exports = new NotificationService();
