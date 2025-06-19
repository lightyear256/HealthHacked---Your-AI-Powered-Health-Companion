
const User = require('../../models/User');
const HealthContext = require('../../models/HealthContext');
const ChatHistory = require('../../models/ChatHistory');
const { generateSessionId } = require('../../utils/helpers');
const logger = require('../../utils/logger');

class ContextManager {
  static async getUserContext(userId, sessionId = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user's last active time
      await user.updateLastActive();

      // Get active health context
      const activeHealthContext = await HealthContext.findOne({
        userId,
        status: 'active'
      }).sort({ createdAt: -1 });

      // Get recent chat history
      const recentChatHistory = await ChatHistory.find({
        userId,
        ...(sessionId && { sessionId })
      }).sort({ createdAt: -1 }).limit(10);

      // Generate session ID if not provided
      const currentSessionId = sessionId || generateSessionId();

      const context = {
        userId,
        sessionId: currentSessionId,
        profile: user.profile,
        preferences: user.preferences,
        hasActiveHealthConcern: !!activeHealthContext,
        activeHealthContext,
        recentChatHistory,
        lastActive: user.lastActive,
        isNewUser: !recentChatHistory || recentChatHistory.length === 0
      };

      logger.info('User context retrieved', {
        userId,
        sessionId: currentSessionId,
        hasActiveContext: !!activeHealthContext,
        historyCount: recentChatHistory?.length || 0
      });

      return context;

    } catch (error) {
      logger.error('Error getting user context:', error);
      throw error;
    }
  }

  static async updateContext(userId, sessionId, updateData) {
    try {
      const updates = {
        lastActive: new Date(),
        ...updateData
      };

      // Update user record
      await User.findByIdAndUpdate(userId, updates);

      // Store chat message if provided
      if (updateData.lastMessage) {
        await this.storeChatMessage(userId, sessionId, updateData.lastMessage);
      }

      logger.info('User context updated', { userId, sessionId });

    } catch (error) {
      logger.error('Error updating context:', error);
      throw error;
    }
  }

  static async storeChatMessage(userId, sessionId, message, contextId = null) {
    try {
      let chatHistory = await ChatHistory.findOne({ userId, sessionId });

      if (!chatHistory) {
        chatHistory = new ChatHistory({
          userId,
          sessionId,
          contextId,
          messages: []
        });
      }

      await chatHistory.addMessage(
        message.role,
        message.content,
        message.chatbotType || 'primary',
        message.metadata || {}
      );

      logger.info('Chat message stored', {
        userId,
        sessionId,
        role: message.role,
        messageCount: chatHistory.messages.length
      });

      return chatHistory;

    } catch (error) {
      logger.error('Error storing chat message:', error);
      throw error;
    }
  }

  static async getSessionHistory(sessionId, limit = 50) {
    try {
      const chatHistory = await ChatHistory.findOne({ sessionId })
        .populate('userId', 'profile.name')
        .populate('contextId', 'primaryConcern status');

      if (!chatHistory) {
        return null;
      }

      return {
        sessionId,
        messages: chatHistory.messages.slice(-limit),
        summary: chatHistory.summary,
        context: chatHistory.contextId,
        user: chatHistory.userId
      };

    } catch (error) {
      logger.error('Error getting session history:', error);
      throw error;
    }
  }

  static async getUserSessions(userId, limit = 20) {
    try {
      const sessions = await ChatHistory.getUserSessions(userId, limit);
      
      return sessions.map(session => ({
        sessionId: session.sessionId,
        lastActivity: session.summary.lastActivity,
        messageCount: session.summary.totalMessages,
        topics: session.summary.topics,
        createdAt: session.createdAt
      }));

    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }

  static async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await ChatHistory.deleteMany({
        'summary.lastActivity': { $lt: cutoffDate },
        isActive: false
      });

      logger.info('Old sessions cleaned up', {
        deletedCount: result.deletedCount,
        cutoffDate
      });

      return result.deletedCount;

    } catch (error) {
      logger.error('Error cleaning up old sessions:', error);
      throw error;
    }
  }
}

module.exports = ContextManager;