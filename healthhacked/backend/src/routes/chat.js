// ================================
// File: backend/src/routes/chat.js
// ================================
const express = require('express');
const { protect } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validation');
const { chatLimiter } = require('../middleware/rateLimiter');
const IntentClassifier = require('../services/ai/intentClassifier');
const ChatRouter = require('../services/core/chatRouter');
const ContextManager = require('../services/core/contextManager');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Apply protection and rate limiting to all chat routes
router.use(protect);
router.use(chatLimiter);

// @route   POST /api/chat
// @desc    Send a chat message
// @access  Private
router.post('/', validateChatMessage, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    // Get user context
    const userContext = await ContextManager.getUserContext(userId, sessionId);

    // Classify intent
    const intent = await IntentClassifier.classifyIntent(message, userContext);

    // Route to appropriate chatbot
    const response = await ChatRouter.routeMessage(intent, message, userContext);

    // Store user message
    await ContextManager.storeChatMessage(userId, userContext.sessionId, {
      role: 'user',
      content: message,
      metadata: {
        intent: intent.intent,
        confidence: intent.confidence
      }
    }, response.contextId);

    // Store AI response
    await ContextManager.storeChatMessage(userId, userContext.sessionId, {
      role: 'assistant',
      content: response.response,
      chatbotType: intent.intent === 'follow_up' ? 'secondary' : 'primary',
      metadata: {
        intent: intent.intent,
        processingTime: response.totalProcessingTime
      }
    }, response.contextId);

    // Update context
    await ContextManager.updateContext(userId, userContext.sessionId, {
      lastIntent: intent.intent
    });

    logger.info('Chat message processed', {
      userId,
      sessionId: userContext.sessionId,
      intent: intent.intent,
      confidence: intent.confidence,
      processingTime: response.totalProcessingTime
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
        ...(response.recommendations && { recommendations: response.recommendations }),
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
});

// @route   GET /api/chat/history/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/history/:sessionId', async (req, res, next) => {
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
});

// @route   GET /api/chat/sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/sessions', async (req, res, next) => {
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
});

// @route   POST /api/chat/feedback
// @desc    Submit feedback for a chat response
// @access  Private
router.post('/feedback', async (req, res, next) => {
  try {
    const { sessionId, messageIndex, rating, feedback } = req.body;

    if (!sessionId || messageIndex === undefined || !rating) {
      return next(new AppError('Session ID, message index, and rating are required', 400));
    }

    // Here you would typically store feedback in a feedback collection
    // For now, we'll just log it
    logger.info('Chat feedback received', {
      userId: req.user._id,
      sessionId,
      messageIndex,
      rating,
      feedback
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;