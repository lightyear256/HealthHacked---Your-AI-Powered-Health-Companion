
const logger = require('../../utils/logger');
const Notification = require('../../models/Notification');

class EmergencyHandler {
  static async handleEmergency(userInput, userContext) {
    try {
      // Log the emergency situation
      logger.warn('Emergency situation detected', {
        userId: userContext.userId,
        input: userInput,
        timestamp: new Date()
      });

      // Create urgent notification for monitoring
      await this.createEmergencyNotification(userContext.userId, userInput);

      // Determine emergency response based on keywords
      const emergencyType = this.classifyEmergencyType(userInput);
      const response = this.getEmergencyResponse(emergencyType);

      return {
        response: response.message,
        emergencyType,
        urgency: "critical",
        emergencyInstructions: response.instructions,
        emergencyContacts: this.getEmergencyContacts(),
        isEmergency: true
      };

    } catch (error) {
      logger.error('Emergency handler error:', error);
      return this.getFallbackEmergencyResponse();
    }
  }

  static classifyEmergencyType(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('chest pain') || lowerInput.includes('heart attack')) {
      return 'cardiac';
    } else if (lowerInput.includes('can\'t breathe') || lowerInput.includes('difficulty breathing')) {
      return 'respiratory';
    } else if (lowerInput.includes('severe bleeding') || lowerInput.includes('bleeding')) {
      return 'trauma';
    } else if (lowerInput.includes('unconscious') || lowerInput.includes('unresponsive')) {
      return 'consciousness';
    } else if (lowerInput.includes('overdose') || lowerInput.includes('poisoning')) {
      return 'poisoning';
    } else if (lowerInput.includes('suicide') || lowerInput.includes('self-harm')) {
      return 'mental_health';
    } else {
      return 'general';
    }
  }

  static getEmergencyResponse(emergencyType) {
    const responses = {
      cardiac: {
        message: "🚨 IMMEDIATE ACTION REQUIRED: If you're experiencing chest pain or signs of a heart attack, call emergency services (911) immediately. Do not drive yourself to the hospital.",
        instructions: [
          "Call 911 immediately",
          "Take aspirin if available and not allergic",
          "Sit down and stay calm",
          "Loosen tight clothing",
          "If someone is with you, have them stay nearby"
        ]
      },
      respiratory: {
        message: "🚨 BREATHING EMERGENCY: If you're having severe difficulty breathing, call 911 immediately. This could be life-threatening.",
        instructions: [
          "Call 911 immediately",
          "Sit upright in a comfortable position",
          "Try to stay calm",
          "Use rescue inhaler if you have one",
          "Do not lie down unless instructed by emergency personnel"
        ]
      },
      trauma: {
        message: "🚨 SEVERE BLEEDING: For severe bleeding, call 911 immediately while applying direct pressure to the wound.",
        instructions: [
          "Call 911 immediately",
          "Apply direct pressure to the wound with clean cloth",
          "Do not remove any objects from the wound",
          "Elevate the injured area if possible",
          "Stay with the person and monitor breathing"
        ]
      },
      consciousness: {
        message: "🚨 UNCONSCIOUS PERSON: If someone is unconscious or unresponsive, call 911 immediately.",
        instructions: [
          "Call 911 immediately",
          "Check for breathing and pulse",
          "Do not move the person unless in immediate danger",
          "Begin CPR if trained and no pulse",
          "Stay with the person until help arrives"
        ]
      },
      poisoning: {
        message: "🚨 POISONING/OVERDOSE: Call 911 immediately. Also contact Poison Control: 1-800-222-1222.",
        instructions: [
          "Call 911 immediately",
          "Call Poison Control: 1-800-222-1222",
          "Do not induce vomiting unless instructed",
          "Keep the person awake and breathing",
          "Bring the substance container if available"
        ]
      },
      mental_health: {
        message: "🚨 MENTAL HEALTH CRISIS: Your life has value. Please reach out for immediate help.",
        instructions: [
          "Call 988 (Suicide & Crisis Lifeline) immediately",
          "Call 911 if in immediate danger",
          "Reach out to a trusted friend or family member",
          "Go to your nearest emergency room",
          "You are not alone - help is available"
        ]
      },
      general: {
        message: "🚨 EMERGENCY SITUATION: If this is a medical emergency, call 911 immediately. Do not wait.",
        instructions: [
          "Call 911 immediately for any life-threatening emergency",
          "Stay calm and provide clear information to emergency services",
          "Follow instructions from emergency personnel",
          "Do not hesitate to seek immediate medical attention"
        ]
      }
    };

    return responses[emergencyType] || responses.general;
  }

  static getEmergencyContacts() {
    return {
      emergency: "911",
      poisonControl: "1-800-222-1222",
      suicidePrevention: "988",
      textCrisisLine: "Text HOME to 741741"
    };
  }

  static async createEmergencyNotification(userId, userInput) {
    try {
      const notification = new Notification({
        userId,
        type: 'system',
        title: 'Emergency Situation Detected',
        message: `Emergency keywords detected in user input: "${userInput.substring(0, 100)}..."`,
        status: 'sent',
        delivery: {
          method: 'email',
          sentAt: new Date()
        },
        metadata: {
          priority: 'urgent',
          category: 'emergency_alert',
          actionRequired: true
        }
      });

      await notification.save();
      
      // In a real system, you might also:
      // - Send alerts to medical staff
      // - Log to security systems
      // - Trigger additional monitoring
      
    } catch (error) {
      logger.error('Failed to create emergency notification:', error);
    }
  }

  static getFallbackEmergencyResponse() {
    return {
      response: "🚨 If this is a medical emergency, please call 911 immediately or go to your nearest emergency room. Your safety is the top priority.",
      emergencyType: "general",
      urgency: "critical",
      emergencyInstructions: [
        "Call 911 for immediate emergency assistance",
        "Go to your nearest emergency room",
        "Do not wait - seek immediate medical attention"
      ],
      emergencyContacts: this.getEmergencyContacts(),
      isEmergency: true
    };
  }
}

module.exports = EmergencyHandler;