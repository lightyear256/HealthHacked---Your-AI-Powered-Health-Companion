const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

class NotificationService {
  constructor() {
    this.transporter = this.createEmailTransporter();
    this.notificationQueue = null;
    this.redis = null;
    
    // Only initialize Redis/Bull if not disabled
    if (process.env.DISABLE_REDIS !== 'true') {
      this.initializeRedis();
    } else {
      logger.info('📧 Notification Service initialized (without Redis)');
    }
  }

  initializeRedis() {
    try {
      const Bull = require('bull');
      const Redis = require('redis');
      
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      this.redis.connect().catch(err => {
        logger.error('Redis connection failed:', err);
      });
      
      // Create notification queue
      this.notificationQueue = new Bull('notification queue', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
        }
      });
      
      this.setupQueueProcessors();
      logger.info('📧 Notification Service initialized with Redis');
    } catch (error) {
      logger.error('Failed to initialize Redis/Bull:', error);
      logger.info('📧 Notification Service running without queue support');
    }
  }

  createEmailTransporter() {
    if (!config.email || !config.email.host || !config.email.user || !config.email.pass) {
      logger.warn('Email configuration incomplete - email notifications disabled');
      return null;
    }

    try {
      return nodemailer.createTransporter({
        host: config.email.host,
        port: config.email.port || 587,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (error) {
      logger.error('Failed to create email transporter:', error);
      return null;
    }
  }

  setupQueueProcessors() {
    if (!this.notificationQueue) return;
    
    // Process daily care check-ins
    this.notificationQueue.process('daily-checkin', async (job) => {
      const { userId, type, content } = job.data;
      await this.processDailyCheckin(userId, type, content);
    });

    // Process follow-up reminders
    this.notificationQueue.process('follow-up', async (job) => {
      const { userId, contextId } = job.data;
      await this.processFollowUpReminder(userId, contextId);
    });

    // Process care plan reminders
    this.notificationQueue.process('care-plan', async (job) => {
      const { userId, carePlanId } = job.data;
      await this.processCarePlanReminder(userId, carePlanId);
    });
  }

  async queueNotification(type, data, delay = 0) {
    if (this.notificationQueue) {
      return await this.notificationQueue.add(type, data, {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });
    } else {
      // If no queue, process immediately
      logger.info('Processing notification immediately (no queue)', { type });
      await this.processNotificationImmediately(type, data);
    }
  }

  async processNotificationImmediately(type, data) {
    switch (type) {
      case 'daily-checkin':
        await this.processDailyCheckin(data.userId, data.type, data.content);
        break;
      case 'follow-up':
        await this.processFollowUpReminder(data.userId, data.contextId);
        break;
      case 'care-plan':
        await this.processCarePlanReminder(data.userId, data.carePlanId);
        break;
      default:
        logger.warn('Unknown notification type:', type);
    }
  }

  async processDailyCheckin(userId, type, content) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailNotifications) {
        return;
      }

      const emailContent = this.createCareEmailTemplate(user, content);
      const subject = `💚 HealthHacked Care Check-in`;

      const result = await this.sendEmail({
        to: user.email,
        subject,
        html: emailContent.html,
        text: emailContent.text
      });

      await Notification.create({
        userId,
        type: 'care_reminder',
        title: subject,
        message: content.message,
        status: result.success ? 'sent' : 'failed',
        delivery: {
          method: 'email',
          sentAt: result.success ? new Date() : null,
          errorMessage: result.error || null
        }
      });

    } catch (error) {
      logger.error('Error processing daily checkin:', error);
    }
  }

  async processFollowUpReminder(userId, contextId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailNotifications) {
        return;
      }

      const HealthContext = require('../../models/HealthContext');
      const context = await HealthContext.findById(contextId);
      
      if (!context) {
        logger.warn('Health context not found for follow-up:', contextId);
        return;
      }

      const emailContent = this.createFollowUpEmailTemplate(user, context);
      const subject = `🩺 Follow-up: How's your ${context.primaryConcern}?`;

      const result = await this.sendEmail({
        to: user.email,
        subject,
        html: emailContent.html,
        text: emailContent.text
      });

      await Notification.create({
        userId,
        type: 'follow_up',
        title: subject,
        message: `Time to check in about your ${context.primaryConcern}`,
        status: result.success ? 'sent' : 'failed',
        metadata: {
          contextId: context._id,
          primaryConcern: context.primaryConcern
        }
      });

    } catch (error) {
      logger.error('Error processing follow-up reminder:', error);
    }
  }

  async processCarePlanReminder(userId, carePlanId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailNotifications) {
        return;
      }

      const CarePlan = require('../../models/CarePlan');
      const carePlan = await CarePlan.findById(carePlanId)
        .populate('contextId');
      
      if (!carePlan) {
        logger.warn('Care plan not found for reminder:', carePlanId);
        return;
      }

      const emailContent = this.createCarePlanEmailTemplate(user, carePlan);
      const subject = `📋 Your ${carePlan.contextId.primaryConcern} Care Plan Update`;

      const result = await this.sendEmail({
        to: user.email,
        subject,
        html: emailContent.html,
        text: emailContent.text
      });

      await Notification.create({
        userId,
        type: 'care_reminder',
        title: subject,
        message: `Updates for your ${carePlan.contextId.primaryConcern} care plan`,
        status: result.success ? 'sent' : 'failed',
        metadata: {
          carePlanId: carePlan._id,
          contextId: carePlan.contextId._id
        }
      });

    } catch (error) {
      logger.error('Error processing care plan reminder:', error);
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
                <p>Hi ${user.profile.name || 'there'}!</p>
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

Hi ${user.profile.name || 'there'}!

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
            .cta-button { background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>💚 Follow-up Check-in</h2>
                <p>Hi ${user.profile.name || 'there'}!</p>
            </div>
            <div class="content">
                <p>It's been ${daysSince} day${daysSince !== 1 ? 's' : ''} since you mentioned your concern about <strong>${healthContext.primaryConcern}</strong>.</p>
                
                <p>How are you feeling now? Any changes or updates you'd like to share?</p>
                
                <a href="${config.server.apiUrl.replace('/api', '')}/chat?context=${healthContext._id}" class="cta-button">
                    Share an Update
                </a>
                
                <p>Your health journey matters, and I'm here to help track your progress.</p>
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

Hi ${user.profile.name || 'there'}!

It's been ${daysSince} day${daysSince !== 1 ? 's' : ''} since you mentioned your concern about ${healthContext.primaryConcern}.

How are you feeling now? Any changes or updates you'd like to share?

Visit ${config.server.apiUrl.replace('/api', '')}/chat?context=${healthContext._id} to share an update.

Your health journey matters, and I'm here to help track your progress.

---
HealthHacked - Your AI Health Companion
Unsubscribe: ${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}
    `;

    return { html, text };
  }

  createCarePlanEmailTemplate(user, carePlan) {
    const incompleteRecommendations = carePlan.recommendations
      .filter(rec => rec.status !== 'completed');
    
    const completedCount = carePlan.recommendations.length - incompleteRecommendations.length;
    const completionPercentage = Math.round((completedCount / carePlan.recommendations.length) * 100);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5b67ca 0%, #3b47b5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .progress-bar { background: #e2e8f0; border-radius: 10px; height: 8px; margin: 10px 0; }
            .progress-fill { background: #5b67ca; height: 100%; border-radius: 10px; width: ${completionPercentage}%; }
            .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #5b67ca; }
            .cta-button { background: #5b67ca; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📋 Care Plan Progress Update</h2>
                <p>Hi ${user.profile.name || 'there'}!</p>
            </div>
            <div class="content">
                <p>Here's your progress on the care plan for <strong>${carePlan.contextId.primaryConcern}</strong>:</p>
                
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p><strong>${completionPercentage}% Complete</strong> (${completedCount} of ${carePlan.recommendations.length} recommendations)</p>
                
                ${incompleteRecommendations.length > 0 ? `
                <h3>Pending Recommendations:</h3>
                ${incompleteRecommendations.slice(0, 3).map(rec => `
                <div class="recommendation">
                    <strong>${rec.title}</strong>
                    <p>${rec.description}</p>
                </div>
                `).join('')}
                ${incompleteRecommendations.length > 3 ? `<p><em>And ${incompleteRecommendations.length - 3} more...</em></p>` : ''}
                ` : '<p>🎉 Congratulations! You\'ve completed all recommendations!</p>'}
                
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
HealthHacked Care Plan Update

Hi ${user.profile.name || 'there'}!

Here's your progress on the care plan for ${carePlan.contextId.primaryConcern}:

Progress: ${completionPercentage}% completed (${completedCount} of ${carePlan.recommendations.length} recommendations)

${incompleteRecommendations.length > 0 ? `
Pending Recommendations:
${incompleteRecommendations.slice(0, 3).map(rec => `• ${rec.title}: ${rec.description}`).join('\n')}
${incompleteRecommendations.length > 3 ? `And ${incompleteRecommendations.length - 3} more...` : ''}
` : '🎉 Congratulations! You\'ve completed all recommendations!'}

View your full care plan: ${config.server.apiUrl.replace('/api', '')}/dashboard/care-plan/${carePlan._id}

Taking small steps each day can lead to significant improvements in your health.

---
HealthHacked - Your AI Health Companion
Unsubscribe: ${config.server.apiUrl}/notifications/unsubscribe?token=${user._id}
    `;

    return { html, text };
  }

  async sendEmergencyAlert(userId, urgency, context) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const subject = `🚨 URGENT: Health Alert - ${urgency.level}`;
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #e53e3e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #fff5f5; padding: 20px; border-radius: 0 0 8px 8px; border: 2px solid #e53e3e; }
              .urgent { color: #e53e3e; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>🚨 Urgent Health Alert</h2>
              </div>
              <div class="content">
                  <p class="urgent">This is an automated alert based on your recent health information.</p>
                  
                  <p><strong>Concern:</strong> ${context.primaryConcern}</p>
                  <p><strong>Urgency Level:</strong> ${urgency.level}</p>
                  <p><strong>Reason:</strong> ${urgency.reason}</p>
                  
                  <h3>Recommended Actions:</h3>
                  <ol>
                      ${urgency.actions.map(action => `<li>${action}</li>`).join('')}
                  </ol>
                  
                  <p class="urgent">If you are experiencing severe symptoms, please seek immediate medical attention or call emergency services.</p>
                  
                  <p>This alert was generated because your symptoms may require prompt medical evaluation. Please consult with a healthcare professional as soon as possible.</p>
              </div>
              <div class="footer">
                  <p>HealthHacked - Your AI Health Companion</p>
                  <p>This is an automated alert. Do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>
      `;

      const emailResult = await this.sendEmail({
        to: user.email,
        subject,
        html,
        text: `URGENT HEALTH ALERT\n\nConcern: ${context.primaryConcern}\nUrgency: ${urgency.level}\n\nPlease seek medical attention immediately.`,
        priority: 'high'
      });

      // Log the emergency notification
      await Notification.create({
        userId,
        type: 'system',
        title: subject,
        message: `Emergency alert: ${urgency.reason}`,
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

  // Cleanup method
  async cleanup() {
    if (this.redis) {
      await this.redis.quit();
    }
    if (this.notificationQueue) {
      await this.notificationQueue.close();
    }
  }
}

module.exports = new NotificationService();