const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Simple auth middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Chat endpoint - DIRECT GEMINI CALL
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('💬 Chat request received:', { message, userId: req.user._id });
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    console.log('🔍 Environment variables check:');
    console.log('🔍 GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
    console.log('🔍 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Try direct Gemini call
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    console.log('🔍 Using API key (first 10 chars):', apiKey?.substring(0, 10) + '...');
    
    if (!apiKey) {
      throw new Error('No API key found in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // FIXED: Use correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const healthPrompt = `You are a helpful health assistant. User asks: "${message}". 

Please provide a helpful, empathetic response that:
1. Acknowledges their concern with empathy
2. Provides general health information (not medical diagnosis)
3. Suggests practical steps they can take
4. Recommends consulting healthcare professionals when appropriate
5. Is encouraging and supportive

Keep your response conversational and under 200 words.`;

    console.log('🔍 Calling Gemini directly...');
    const result = await model.generateContent(healthPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Direct Gemini call successful!');
    console.log('📝 AI Response length:', text.length);
    
    res.json({
      success: true,
      data: {
        response: text,
        sessionId: 'session-' + Date.now(),
        intent: 'health_query',
        confidence: 0.9,
        contextId: null, // Will add later when we implement health contexts
        processingTime: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Fallback response
    const fallbackResponse = `I'm sorry, I'm having technical difficulties right now. For any urgent health concerns, please consult with a healthcare professional immediately.

Technical error: ${error.message}

I'm still learning and improving. Please try again in a moment, or feel free to ask about general health topics.`;
    
    res.json({
      success: true,
      data: {
        response: fallbackResponse,
        sessionId: 'fallback-' + Date.now(),
        intent: 'health_query',
        confidence: 0.5,
        error: error.message
      }
    });
  }
});

module.exports = router;