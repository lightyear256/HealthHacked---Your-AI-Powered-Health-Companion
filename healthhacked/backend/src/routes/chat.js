// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const geminiService = require('../services/ai/geminiService');

// const router = express.Router();

// // Simple auth middleware
// const protect = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ success: false, error: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
//     const user = await User.findById(decoded.id);
    
//     if (!user) {
//       return res.status(401).json({ success: false, error: 'User not found' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ success: false, error: 'Invalid token' });
//   }
// };

// // Chat endpoint
// router.post('/', protect, async (req, res) => {
//   try {
//     const { message } = req.body;
    
//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Message is required'
//       });
//     }

//     console.log('Processing chat message:', message);

//     // Create a health-focused prompt
//     const healthPrompt = `
// You are a helpful health information assistant. A user asks: "${message}"

// Please provide a helpful, empathetic response that:
// 1. Acknowledges their concern
// 2. Provides general health information (not medical diagnosis)
// 3. Suggests practical steps they can take
// 4. Recommends consulting healthcare professionals when appropriate
// 5. Is encouraging and supportive

// Keep your response conversational and under 200 words.
//     `;

//     // Call Gemini AI
//     const aiResult = await geminiService.generateWithSafety(
//       healthPrompt,
//       req.user._id.toString(),
//       { type: 'health_chat' }
//     );

//     console.log('AI response generated successfully');

//     res.json({
//       success: true,
//       data: {
//         response: aiResult.content,
//         sessionId: 'session-' + Date.now(),
//         intent: 'health_query',
//         confidence: 0.9,
//         processingTime: aiResult.processingTime
//       }
//     });

//   } catch (error) {
//     console.error('Chat error:', error);
    
//     // Fallback response if AI fails
//     const fallbackResponse = `I understand you're asking about "${req.body.message}". While I'm having some technical difficulties right now, I want to help. For any health concerns, I always recommend consulting with a healthcare professional who can provide personalized advice. In the meantime, monitor your symptoms and don't hesitate to seek immediate medical attention if you're worried.`;
    
//     res.json({
//       success: true,
//       data: {
//         response: fallbackResponse,
//         sessionId: 'fallback-' + Date.now(),
//         intent: 'health_query',
//         confidence: 0.5
//       }
//     });
//   }
// });

// module.exports = router;

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
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Chat endpoint - DIRECT GEMINI CALL (bypass our service for now)
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const healthPrompt = `You are a helpful health assistant. User asks: "${message}". Provide a brief, empathetic response with general health information (not medical diagnosis). Keep it under 150 words.`;

    console.log('🔍 Calling Gemini directly...');
    const result = await model.generateContent(healthPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Direct Gemini call successful!');
    console.log('🔍 Response length:', text.length);

    res.json({
      success: true,
      data: {
        response: text,
        sessionId: 'direct-' + Date.now(),
        intent: 'health_query',
        confidence: 0.9
      }
    });

  } catch (error) {
    console.error('❌ DETAILED ERROR:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Full error:', error);
    
    // Send error details to frontend for debugging
    res.json({
      success: true,
      data: {
        response: `DEBUG ERROR: ${error.message}. This helps us fix the issue!`,
        sessionId: 'error-' + Date.now(),
        intent: 'error',
        confidence: 0.1
      }
    });
  }
});

module.exports = router;