

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiService {
  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",  // FIXED: Using correct model name
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    logger.info('🤖 Gemini Service initialized');
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
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = result.content;
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      }
      if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/g, '');
      }
      
      const parsedResponse = JSON.parse(cleanedContent.trim());
      return {
        ...result,
        content: parsedResponse
      };
    } catch (error) {
      logger.error('Failed to parse structured response:', error);
      logger.error('Raw content:', result.content);
      
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