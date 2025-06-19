const express = require('express');
const { protect } = require('../middleware/auth');
const PrimaryChatbot = require('../services/ai/primaryChatbot');
const SecondaryChatbot = require('../services/ai/secondaryChatbot');
const HealthContext = require('../models/HealthContext');
const ChatHistory = require('../models/ChatHistory');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/chat
// @desc    Send message to AI chatbot
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return next(new AppError('Message is required', 400));
    }

    logger.info('Chat message received', {
      userId,
      messageLength: message.length,
      sessionId
    });

    // Check if user has active health contexts
    const activeContexts = await HealthContext.find({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    const hasActiveContext = activeContexts.length > 0;
    
    // Build user context
    const userContext = {
      userId,
      sessionId: sessionId || `session-${Date.now()}`,
      profile: req.user.profile,
      hasActiveHealthConcern: hasActiveContext,
      activeContexts
    };

    let response;

    // Determine if this is a follow-up or new medical query
    const isFollowUp = hasActiveContext && (
      message.toLowerCase().includes('better') ||
      message.toLowerCase().includes('worse') ||
      message.toLowerCase().includes('same') ||
      message.toLowerCase().includes('update') ||
      message.toLowerCase().includes('progress') ||
      sessionId
    );

    if (isFollowUp && activeContexts.length > 0) {
      // Use secondary chatbot for follow-ups
      logger.info('Routing to secondary chatbot', { userId });
      response = await SecondaryChatbot.handleFollowUp(message, userContext);
    } else {
      // Use primary chatbot for new medical queries
      logger.info('Routing to primary chatbot', { userId });
      response = await PrimaryChatbot.handleMedicalQuery(message, userContext);
    }

    // Store chat messages
    await storeChatMessage(userId, userContext.sessionId, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    await storeChatMessage(userId, userContext.sessionId, {
      role: 'assistant',
      content: response.response,
      timestamp: new Date(),
      metadata: {
        contextId: response.contextId,
        severity: response.severity,
        intent: response.intent || 'health_query'
      }
    });

    logger.info('Chat response generated successfully', {
      userId,
      sessionId: userContext.sessionId,
      contextId: response.contextId,
      hasContext: !!response.contextId
    });

    res.json({
      success: true,
      data: {
        response: response.response,
        sessionId: userContext.sessionId,
        contextId: response.contextId,
        severity: response.severity,
        potentialCauses: response.potentialCauses,
        immediateSteps: response.immediateSteps,
        seekHelpIf: response.seekHelpIf,
        followUpQuestion: response.followUpQuestion,
        intent: response.intent || 'health_query',
        confidence: response.confidence || 0.8,
        processingTime: response.processingTime
      }
    });

  } catch (error) {
    logger.error('Chat processing error', {
      userId: req.user._id,
      error: error.message,
      stack: error.stack
    });

    // Fallback response for errors
    const fallbackResponse = "I'm sorry, I'm having technical difficulties right now. For any urgent health concerns, please consult with a healthcare professional immediately.";
    
    res.json({
      success: true,
      data: {
        response: fallbackResponse,
        sessionId: `fallback-${Date.now()}`,
        intent: 'fallback',
        confidence: 0.1,
        error: error.message
      }
    });
  }
});

// @route   GET /api/chat/history/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/history/:sessionId', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const chatHistory = await ChatHistory.findOne({
      userId,
      sessionId
    });

    if (!chatHistory) {
      return res.json({
        success: true,
        data: {
          messages: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        messages: chatHistory.messages,
        sessionId: chatHistory.sessionId
      }
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to store chat messages
async function storeChatMessage(userId, sessionId, message) {
  try {
    let chatHistory = await ChatHistory.findOne({ userId, sessionId });
    
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId,
        sessionId,
        messages: []
      });
    }
    
    chatHistory.messages.push(message);
    await chatHistory.save();
    
    return chatHistory;
  } catch (error) {
    logger.error('Error storing chat message:', error);
  }
}

module.exports = router;