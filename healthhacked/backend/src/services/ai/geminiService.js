// // ================================
// // File: backend/src/services/ai/geminiService.js
// // ================================
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const logger = require('../../utils/logger');
// const config = require('../../config');
// const Redis = require('redis');

// class GeminiService {
//   constructor() {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error('GEMINI_API_KEY is required');
//     }
    
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     this.model = this.genAI.getGenerativeModel({ 
//       model: "gemini-2.0-flash-exp",
//       generationConfig: {
//         temperature: 0.7,
//         topK: 40,
//         topP: 0.95,
//         maxOutputTokens: 1024,
//       }
//     });
    
//     // Initialize Redis for rate limiting
//     this.redis = Redis.createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379'
//     });
//     this.redis.connect().catch(console.error);
    
//     logger.info('🤖 Gemini Service initialized');
//   }

//   async generateContent(prompt, options = {}) {
//     const startTime = Date.now();
    
//     try {
//       const result = await this.model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();
      
//       const processingTime = Date.now() - startTime;
      
//       logger.info('Gemini API call successful', {
//         processingTime,
//         promptLength: prompt.length,
//         responseLength: text.length
//       });
      
//       return {
//         content: text,
//         processingTime,
//         tokensUsed: this.estimateTokens(prompt + text)
//       };
      
//     } catch (error) {
//       logger.error('Gemini API error:', {
//         error: error.message,
//         processingTime: Date.now() - startTime
//       });
//       throw new Error('AI service temporarily unavailable');
//     }
//   }

//   async generateWithSafety(prompt, userId, context = {}) {
//     // Rate limiting check
//     const rateLimitKey = `gemini_calls_${userId}`;
//     const callCount = await this.redis.get(rateLimitKey) || 0;
    
//     if (parseInt(callCount) > 50) { // 50 calls per hour
//       throw new Error('Rate limit exceeded. Please try again later.');
//     }
    
//     // Increment rate limit counter
//     await this.redis.setEx(rateLimitKey, 3600, parseInt(callCount) + 1);
    
//     // Add safety wrapper to prompt
//     const safePrompt = this.wrapWithSafetyInstructions(prompt, context);
    
//     const result = await this.generateContent(safePrompt);
    
//     // Validate response for safety
//     if (this.containsUnsafeContent(result.content)) {
//       logger.warn('Unsafe content detected in AI response', { userId });
//       throw new Error('Generated content failed safety check');
//     }
    
//     return result;
//   }

//   wrapWithSafetyInstructions(prompt, context) {
//     return `
// IMPORTANT SAFETY INSTRUCTIONS:
// - You are a health information assistant, NOT a medical doctor
// - Never provide definitive medical diagnoses
// - Always recommend consulting healthcare professionals for serious concerns
// - Be empathetic and supportive
// - If emergency symptoms are mentioned, immediately advise seeking emergency care
// - Don't provide specific medication dosages or prescriptions

// USER CONTEXT: ${JSON.stringify(context)}

// USER QUERY: ${prompt}

// Remember: Provide helpful, supportive information while emphasizing the importance of professional medical care when appropriate.
//     `.trim();
//   }

//   containsUnsafeContent(content) {
//     const unsafePatterns = [
//       /take \d+.*pills?/i,
//       /dosage.*\d+.*mg/i,
//       /you definitely have/i,
//       /i diagnose you with/i,
//       /stop taking.*medication/i
//     ];
    
//     return unsafePatterns.some(pattern => pattern.test(content));
//   }

//   estimateTokens(text) {
//     // Rough estimation: 1 token ≈ 4 characters
//     return Math.ceil(text.length / 4);
//   }

//   async generateStructuredResponse(prompt, schema) {
//     const structuredPrompt = `
// ${prompt}

// Please respond in the following JSON format:
// ${JSON.stringify(schema, null, 2)}

// Ensure your response is valid JSON that matches this schema exactly.
//     `;
    
//     const result = await this.generateContent(structuredPrompt);
    
//     try {
//       const parsedResponse = JSON.parse(result.content);
//       return {
//         ...result,
//         content: parsedResponse
//       };
//     } catch (error) {
//       logger.error('Failed to parse structured response:', error);
//       throw new Error('AI response format error');
//     }
//   }
// }

// module.exports = new GeminiService();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiService {
  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    logger.info('🤖 Gemini Service initialized (without Redis)');
  }

  async generateContent(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const processingTime = Date.now() - startTime;
      
      logger.info('Gemini API call successful', {
        processingTime,
        promptLength: prompt.length,
        responseLength: text.length
      });
      
      return {
        content: text,
        processingTime,
        tokensUsed: this.estimateTokens(prompt + text)
      };
      
    } catch (error) {
      logger.error('Gemini API error:', {
        error: error.message,
        processingTime: Date.now() - startTime
      });
      throw new Error('AI service temporarily unavailable');
    }
  }

  async generateWithSafety(prompt, userId, context = {}) {
    // Simple rate limiting without Redis - just log it
    logger.info('Gemini request', { userId, promptLength: prompt.length });
    
    // Add safety wrapper to prompt
    const safePrompt = this.wrapWithSafetyInstructions(prompt, context);
    
    const result = await this.generateContent(safePrompt);
    
    // Validate response for safety
    if (this.containsUnsafeContent(result.content)) {
      logger.warn('Unsafe content detected in AI response', { userId });
      throw new Error('Generated content failed safety check');
    }
    
    return result;
  }

  wrapWithSafetyInstructions(prompt, context) {
    return `
IMPORTANT SAFETY INSTRUCTIONS:
- You are a health information assistant, NOT a medical doctor
- Never provide definitive medical diagnoses
- Always recommend consulting healthcare professionals for serious concerns
- Be empathetic and supportive
- If emergency symptoms are mentioned, immediately advise seeking emergency care

USER CONTEXT: ${JSON.stringify(context)}

USER QUERY: ${prompt}

Remember: Provide helpful, supportive information while emphasizing the importance of professional medical care when appropriate.
    `.trim();
  }

  containsUnsafeContent(content) {
    const unsafePatterns = [
      /take \d+.*pills?/i,
      /dosage.*\d+.*mg/i,
      /you definitely have/i,
      /i diagnose you with/i,
      /stop taking.*medication/i
    ];
    
    return unsafePatterns.some(pattern => pattern.test(content));
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  async generateStructuredResponse(prompt, schema) {
    const structuredPrompt = `
${prompt}

Please respond in JSON format with this structure:
{
  "response": "Your main response text",
  "potentialCauses": ["cause1", "cause2", "cause3"],
  "immediateSteps": ["step1", "step2", "step3"],
  "seekHelpIf": ["condition1", "condition2"],
  "followUpQuestion": "Relevant question to ask",
  "severity": "low|medium|high"
}

Ensure your response is valid JSON.
    `;
    
    const result = await this.generateContent(structuredPrompt);
    
    try {
      const parsedResponse = JSON.parse(result.content);
      return {
        ...result,
        content: parsedResponse
      };
    } catch (error) {
      logger.error('Failed to parse structured response:', error);
      // Return a fallback response
      return {
        ...result,
        content: {
          response: result.content,
          potentialCauses: ["Various factors could be contributing"],
          immediateSteps: ["Monitor symptoms", "Stay hydrated", "Rest"],
          seekHelpIf: ["Symptoms worsen", "Fever develops"],
          followUpQuestion: "How long have you been experiencing this?",
          severity: "medium"
        }
      };
    }
  }
}

module.exports = new GeminiService();