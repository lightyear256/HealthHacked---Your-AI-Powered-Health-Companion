// ================================
// File: backend/src/services/core/chatRouter.js
// ================================
const IntentClassifier = require('../ai/intentClassifier');
const PrimaryChatbot = require('../ai/primaryChatbot');
const SecondaryChatbot = require('../ai/secondaryChatbot');
const EmergencyHandler = require('./emergencyHandler');
const logger = require('../../utils/logger');

class ChatRouter {
  static async routeMessage(intent, userInput, userContext) {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (intent.intent) {
        case IntentClassifier.INTENTS.EMERGENCY:
          response = await EmergencyHandler.handleEmergency(userInput, userContext);
          break;
          
        case IntentClassifier.INTENTS.NEW_MEDICAL_QUERY:
          response = await PrimaryChatbot.handleMedicalQuery(userInput, userContext);
          break;
          
        case IntentClassifier.INTENTS.FOLLOW_UP:
          response = await SecondaryChatbot.handleFollowUp(userInput, userContext);
          break;
          
        case IntentClassifier.INTENTS.GENERAL_WELLNESS:
          response = await PrimaryChatbot.handleGeneralWellness(userInput, userContext);
          break;
          
        case IntentClassifier.INTENTS.MEDICATION_INQUIRY:
          response = await this.handleMedicationInquiry(userInput, userContext);
          break;
          
        case IntentClassifier.INTENTS.APPOINTMENT_RELATED:
          response = await this.handleAppointmentQuery(userInput, userContext);
          break;
          
        default:
          response = await PrimaryChatbot.handleGeneralWellness(userInput, userContext);
          break;
      }

      const processingTime = Date.now() - startTime;
      
      logger.info('Message routed successfully', {
        intent: intent.intent,
        confidence: intent.confidence,
        processingTime,
        userId: userContext.userId
      });

      return {
        ...response,
        intent: intent.intent,
        confidence: intent.confidence,
        totalProcessingTime: processingTime
      };

    } catch (error) {
      logger.error('Chat routing error:', {
        error: error.message,
        intent: intent.intent,
        userId: userContext.userId
      });
      
      return this.getFallbackResponse(userInput);
    }
  }

  static async handleMedicationInquiry(userInput, userContext) {
    // Placeholder for medication inquiry handling
    // This would integrate with external medication APIs
    return {
      response: "I understand you have questions about medications. For specific medication information, dosages, or interactions, I recommend consulting with your pharmacist or healthcare provider who can give you accurate, personalized advice.",
      type: "medication_disclaimer",
      suggestions: [
        "Speak with your pharmacist about medication questions",
        "Consult your doctor about medication concerns",
        "Check the medication's patient information leaflet"
      ]
    };
  }

  static async handleAppointmentQuery(userInput, userContext) {
    // Placeholder for appointment-related queries
    return {
      response: "For appointment scheduling or questions about upcoming medical visits, I recommend contacting your healthcare provider's office directly. They'll have access to current availability and your specific needs.",
      type: "appointment_guidance",
      suggestions: [
        "Call your doctor's office for appointment scheduling",
        "Prepare a list of questions for your appointment",
        "Bring a list of current medications to your visit"
      ]
    };
  }

  static getFallbackResponse(userInput) {
    return {
      response: "I want to help you with your health concerns. Could you please rephrase your question or provide more details about what you're experiencing?",
      type: "fallback",
      suggestions: [
        "Describe any symptoms you're experiencing",
        "Ask about general wellness topics",
        "Share any specific health concerns"
      ],
      intent: "fallback",
      confidence: 0.5
    };
  }
}

module.exports = ChatRouter;