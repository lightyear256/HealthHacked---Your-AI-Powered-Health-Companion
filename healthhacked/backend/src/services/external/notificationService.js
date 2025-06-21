const nodemailer = require('nodemailer');
const Bull = require('bull');
const { createClient } = require('redis');
const config = require('../../config');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

class NotificationService {
  constructor() {
    // Don't initialize in constructor to avoid timing issues
    this.transporter = null;
    this.notificationQueue = null;
    this.redis = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    this.transporter = this.createEmailTransporter();
    await this.initializeServices();
    this.initialized = true;
  }

  async initializeServices() {
    try {
      // Initialize Redis with your Redis Cloud credentials
      if (process.env.DISABLE_REDIS !== 'true') {
        this.redis = createClient({
          username: 'default',
          password: process.env.REDIS_PASSWORD || 'nSiJcXdvVQqqoiZT85hKE2aO0dCrulpN',
          socket: {
            host: process.env.REDIS_HOST || 'redis-19765.c330.asia-south1-1.gce.redns.redis-cloud.com',
            port: parseInt(process.env.REDIS_PORT) || 19765
          }
        });

        this.redis.on('error', err => {
          logger.error('Redis Client Error:', err);
        });

        await this.redis.connect();
        logger.info('✅ Redis connected successfully');

        this.notificationQueue = new Bull('notification-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
  }
});

        this.setupQueueProcessors();
        logger.info('📧 Notification Service initialized with Redis');
      } else {
        logger.info('📧 Notification Service initialized (without Redis)');
      }
    } catch (error) {
      logger.error('Failed to initialize Redis/Bull:', error);
      logger.info('📧 Notification Service running without queue support');
    }
  }

  createEmailTransporter() {
    // Debug logging
    logger.info('Creating email transporter...');
    logger.info('Email config:', {
      host: config.email?.host,
      port: config.email?.port,
      user: config.email?.user,
      hasPass: !!config.email?.pass,
      from: config.email?.from
    });

    if (!config.email || !config.email.host || !config.email.user || !config.email.pass) {
      logger.warn('Email configuration incomplete - email notifications disabled', {
        hasConfig: !!config.email,
        hasHost: !!config.email?.host,
        hasUser: !!config.email?.user,
        hasPass: !!config.email?.pass
      });
      return null;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: parseInt(config.email.port) || 587,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: true, // Enable debug output
        logger: true // Log to console
      });

      // Verify transporter configuration
      transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('✅ Email transporter ready');
        }
      });

      return transporter;
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

    logger.info('✅ Queue processors set up');
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

  // Test email functionality
  async sendTestEmail(to) {
    const subject = '🧪 HealthHacked Test Email';
    const html = `
      <h2>Test Email from HealthHacked</h2>
      <p>This is a test email to verify your email configuration is working correctly.</p>
      <p>If you received this email, your notification system is set up properly!</p>
      <hr>
      <p><small>HealthHacked - Your AI Health Companion</small></p>
    `;
    const text = 'Test Email from HealthHacked\n\nThis is a test email to verify your email configuration is working correctly.';

    return await this.sendEmail({ to, subject, html, text });
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
      .filter(rec => !rec.completed);
    
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

// Create a singleton instance but don't initialize yet
const notificationService = new NotificationService();

// Initialize when actually used
const initializeService = async () => {
  await notificationService.initialize();
  return notificationService;
};

// Export a proxy that initializes on first use
module.exports = new Proxy(notificationService, {
  get(target, prop) {
    // If accessing a method that needs initialization
    if (typeof target[prop] === 'function' && !target.initialized) {
      return async (...args) => {
        await target.initialize();
        return target[prop](...args);
      };
    }
    return target[prop];
  }
});