const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiConfig {
  constructor() {
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is required in environment variables');
    }
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    logger.info('🤖 Gemini AI configured successfully');
  }

  getModel() {
    return this.model;
  }
}

module.exports = new GeminiConfig();