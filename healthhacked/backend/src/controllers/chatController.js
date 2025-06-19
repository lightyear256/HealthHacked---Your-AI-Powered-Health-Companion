
const IntentClassifier = require('../services/ai/intentClassifier');
const ChatRouter = require('../services/core/chatRouter');
const ContextManager = require('../services/core/contextManager');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class ChatController {
  static async sendMessage(req, res, next) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user._id;

      // Get user context
      const userContext = await ContextManager.getUserContext(userId, sessionId);

      // Classify intent
      const intent = await IntentClassifier.classifyIntent(message, userContext);

      // Route to appropriate chatbot
      const response = await ChatRouter.routeMessage(intent, message, userContext);

      // Store messages
      await ContextManager.storeChatMessage(userId, userContext.sessionId, {
        role: 'user',
        content: message,
        metadata: { intent: intent.intent, confidence: intent.confidence }
      }, response.contextId);

      await ContextManager.storeChatMessage(userId, userContext.sessionId, {
        role: 'assistant',
        content: response.response,
        chatbotType: intent.intent === 'follow_up' ? 'secondary' : 'primary',
        metadata: { intent: intent.intent, processingTime: response.totalProcessingTime }
      }, response.contextId);

      // Update context
      await ContextManager.updateContext(userId, userContext.sessionId, {
        lastIntent: intent.intent
      });

      logger.info('Chat message processed', {
        userId,
        sessionId: userContext.sessionId,
        intent: intent.intent,
        confidence: intent.confidence
      });

      res.json({
        success: true,
        data: {
          response: response.response,
          sessionId: userContext.sessionId,
          intent: intent.intent,
          confidence: intent.confidence,
          processingTime: response.totalProcessingTime,
          ...(response.contextId && { contextId: response.contextId }),
          ...(response.potentialCauses && { potentialCauses: response.potentialCauses }),
          ...(response.immediateSteps && { immediateSteps: response.immediateSteps }),
          ...(response.isEmergency && { 
            emergency: {
              type: response.emergencyType,
              instructions: response.emergencyInstructions,
              contacts: response.emergencyContacts
            }
          })
        }
      });

    } catch (error) {
      next(error);
    }
  }

  static async getChatHistory(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      const sessionHistory = await ContextManager.getSessionHistory(sessionId, parseInt(limit));

      if (!sessionHistory) {
        return next(new AppError('Session not found', 404));
      }

      // Verify user owns this session
      if (sessionHistory.user._id.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to access this session', 403));
      }

      res.json({
        success: true,
        data: sessionHistory
      });

    } catch (error) {
      next(error);
    }
  }

  static async getUserSessions(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const userId = req.user._id;

      const sessions = await ContextManager.getUserSessions(userId, parseInt(limit));

      res.json({
        success: true,
        data: {
          sessions,
          count: sessions.length
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;