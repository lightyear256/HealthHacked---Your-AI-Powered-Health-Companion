
const geminiService = require('./geminiService');
const logger = require('../../utils/logger');

class IntentClassifier {
  static INTENTS = {
    NEW_MEDICAL_QUERY: 'new_medical_query',
    FOLLOW_UP: 'follow_up',
    GENERAL_WELLNESS: 'general_wellness',
    EMERGENCY: 'emergency',
    MEDICATION_INQUIRY: 'medication_inquiry',
    APPOINTMENT_RELATED: 'appointment_related',
    GENERAL_CHAT: 'general_chat'
  };

  static async classifyIntent(userInput, userContext) {
    try {
      // Emergency detection (highest priority)
      const emergencyResult = this.detectEmergency(userInput);
      if (emergencyResult.isEmergency) {
        return {
          intent: this.INTENTS.EMERGENCY,
          confidence: emergencyResult.confidence,
          reasoning: 'Emergency keywords detected'
        };
      }

      // Check for follow-up patterns if user has active health context
      if (userContext.hasActiveHealthConcern) {
        const followUpResult = this.detectFollowUp(userInput);
        if (followUpResult.isFollowUp) {
          return {
            intent: this.INTENTS.FOLLOW_UP,
            confidence: followUpResult.confidence,
            reasoning: 'Follow-up pattern detected with active health context'
          };
        }
      }

      // Use Gemini for complex intent classification
      const aiClassification = await this.classifyWithAI(userInput, userContext);
      return aiClassification;

    } catch (error) {
      logger.error('Intent classification error:', error);
      // Fallback to default classification
      return {
        intent: this.INTENTS.GENERAL_WELLNESS,
        confidence: 0.5,
        reasoning: 'Fallback due to classification error'
      };
    }
  }

  static detectEmergency(userInput) {
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing',
      'severe bleeding', 'unconscious', 'overdose', 'suicide', 'emergency',
      'ambulance', 'hospital now', 'severe pain', 'stroke symptoms',
      'allergic reaction', 'anaphylaxis', 'choking'
    ];

    const criticalPhrases = [
      'call 911', 'need emergency', 'life threatening', 'can\'t move',
      'losing consciousness', 'severe allergic'
    ];

    const lowerInput = userInput.toLowerCase();
    let confidence = 0;

    // Check for emergency keywords
    const keywordMatches = emergencyKeywords.filter(keyword => 
      lowerInput.includes(keyword)
    );
    
    // Check for critical phrases (higher weight)
    const phraseMatches = criticalPhrases.filter(phrase => 
      lowerInput.includes(phrase)
    );

    if (phraseMatches.length > 0) {
      confidence = 0.95;
    } else if (keywordMatches.length >= 2) {
      confidence = 0.9;
    } else if (keywordMatches.length === 1) {
      confidence = 0.7;
    }

    return {
      isEmergency: confidence >= 0.7,
      confidence,
      matchedKeywords: keywordMatches,
      matchedPhrases: phraseMatches
    };
  }

  static detectFollowUp(userInput) {
    const followUpKeywords = [
      'update', 'still having', 'better', 'worse', 'how am i doing',
      'progress', 'feeling', 'symptoms', 'still', 'not better',
      'getting better', 'same', 'different', 'changed'
    ];

    const followUpPhrases = [
      'since last time', 'since yesterday', 'still experiencing',
      'as you suggested', 'tried what you said', 'following your advice'
    ];

    const lowerInput = userInput.toLowerCase();
    let confidence = 0;

    const keywordMatches = followUpKeywords.filter(keyword => 
      lowerInput.includes(keyword)
    );
    
    const phraseMatches = followUpPhrases.filter(phrase => 
      lowerInput.includes(phrase)
    );

    if (phraseMatches.length > 0) {
      confidence = 0.9;
    } else if (keywordMatches.length >= 2) {
      confidence = 0.8;
    } else if (keywordMatches.length === 1) {
      confidence = 0.6;
    }

    return {
      isFollowUp: confidence >= 0.6,
      confidence,
      matchedKeywords: keywordMatches,
      matchedPhrases: phraseMatches
    };
  }

  static async classifyWithAI(userInput, userContext) {
    const classificationPrompt = `
Classify this health-related message into one of these categories:

CATEGORIES:
1. new_medical_query: New symptoms, health concerns, or medical questions
2. follow_up: Updates on existing conditions or previous conversations
3. general_wellness: General health questions, wellness tips, prevention
4. medication_inquiry: Questions about medications, side effects, interactions
5. appointment_related: Scheduling, preparing for, or discussing medical appointments
6. general_chat: Casual conversation, greetings, non-health related

USER MESSAGE: "${userInput}"

USER CONTEXT:
- Has active health concern: ${userContext.hasActiveHealthConcern}
- Recent chat history: ${userContext.recentChatHistory ? 'Yes' : 'No'}

Provide your response in this JSON format:
{
  "intent": "category_name",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this category was chosen",
  "keywords": ["relevant", "keywords", "found"]
}
    `;

    try {
      const result = await geminiService.generateStructuredResponse(
        classificationPrompt,
        {
          intent: "string",
          confidence: "number",
          reasoning: "string",
          keywords: ["array", "of", "strings"]
        }
      );

      return {
        intent: result.content.intent,
        confidence: result.content.confidence,
        reasoning: result.content.reasoning,
        keywords: result.content.keywords,
        processingTime: result.processingTime
      };

    } catch (error) {
      logger.error('AI intent classification failed:', error);
      
      // Fallback logic
      if (this.containsHealthKeywords(userInput)) {
        return {
          intent: this.INTENTS.NEW_MEDICAL_QUERY,
          confidence: 0.6,
          reasoning: 'Fallback: Health keywords detected'
        };
      } else {
        return {
          intent: this.INTENTS.GENERAL_WELLNESS,
          confidence: 0.5,
          reasoning: 'Fallback: Default classification'
        };
      }
    }
  }

  static containsHealthKeywords(input) {
    const healthKeywords = [
      'pain', 'hurt', 'ache', 'sick', 'ill', 'symptom', 'fever',
      'headache', 'stomach', 'nausea', 'tired', 'fatigue', 'dizzy',
      'cough', 'cold', 'flu', 'infection', 'doctor', 'medical'
    ];

    const lowerInput = input.toLowerCase();
    return healthKeywords.some(keyword => lowerInput.includes(keyword));
  }
}

module.exports = IntentClassifier;
