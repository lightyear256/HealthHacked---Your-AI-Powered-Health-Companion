// ================================
// File: backend/src/services/ai/secondaryChatbot.js
// ================================
const geminiService = require('./geminiService');
const HealthContext = require('../../models/HealthContext');
const CarePlan = require('../../models/CarePlan');
const { calculateDaysSince } = require('../../utils/helpers');
const logger = require('../../utils/logger');

class SecondaryChatbot {
  static async handleFollowUp(userInput, userContext) {
    try {
      const activeContext = await HealthContext.findOne({
        userId: userContext.userId,
        status: 'active'
      }).sort({ createdAt: -1 });

      if (!activeContext) {
        // If no active context, redirect to primary chatbot
        const PrimaryChatbot = require('./primaryChatbot');
        return await PrimaryChatbot.handleMedicalQuery(userInput, userContext);
      }

      const followUpPrompt = this.buildFollowUpPrompt(userInput, activeContext, userContext);
      
      const result = await geminiService.generateWithSafety(
        followUpPrompt,
        userContext.userId,
        { type: 'follow_up', contextId: activeContext._id }
      );

      const response = JSON.parse(result.content);
      
      // Update health context based on progress
      await this.updateHealthContext(activeContext, response, userInput);
      
      // Update care plan if needed
      await this.updateCarePlan(activeContext, response);
      
      return {
        response: response.response,
        progressAssessment: response.progressAssessment,
        recommendations: response.recommendations,
        nextQuestion: response.nextQuestion,
        urgency: response.urgency,
        contextId: activeContext._id,
        processingTime: result.processingTime
      };

    } catch (error) {
      logger.error('Secondary chatbot follow-up error:', error);
      return this.getFallbackFollowUpResponse();
    }
  }

  static buildFollowUpPrompt(userInput, activeContext, userContext) {
    const daysSince = calculateDaysSince(activeContext.createdAt);
    
    return `
You are a caring digital health assistant following up with a user.

ORIGINAL CONCERN: "${activeContext.primaryConcern}"
CURRENT UPDATE: "${userInput}"
DAYS SINCE INITIAL CONCERN: ${daysSince}
PREVIOUS SYMPTOMS: ${activeContext.symptoms.join(', ')}
INITIAL SEVERITY: ${activeContext.severity}/10

USER PROFILE:
- Name: ${userContext.profile?.name || 'User'}
- Age: ${userContext.profile?.age || 'Not specified'}

INSTRUCTIONS:
Provide a compassionate follow-up response that:
1. Acknowledges their update warmly
2. Assesses if they're improving, staying the same, or getting worse
3. Provides relevant advice based on their progress
4. Asks a specific follow-up question to gather more information
5. Determines urgency level for seeking medical attention

Be caring, personal, and show that you remember their situation.

Respond in JSON format:
{
  "response": "Your caring, personalized response (2-3 sentences)",
  "progressAssessment": "improving|stable|worsening|unclear",
  "recommendations": ["rec1", "rec2", "rec3"],
  "nextQuestion": "Specific follow-up question",
  "urgency": "low|medium|high",
  "shouldSeekCare": "boolean"
}
    `;
  }

  static async updateHealthContext(healthContext, aiResponse, userInput) {
    // Update severity based on progress assessment
    let severityChange = 0;
    switch (aiResponse.progressAssessment) {
      case 'improving':
        severityChange = -1;
        break;
      case 'worsening':
        severityChange = +2;
        break;
      case 'stable':
        severityChange = 0;
        break;
      default:
        severityChange = 0;
    }

    healthContext.severity = Math.max(1, Math.min(10, healthContext.severity + severityChange));
    
    // Update AI assessment
    healthContext.aiAssessment.riskLevel = aiResponse.urgency;
    
    // Add to additional info
    if (!healthContext.additionalInfo) {
      healthContext.additionalInfo = {};
    }
    
    if (!healthContext.additionalInfo.followUpNotes) {
      healthContext.additionalInfo.followUpNotes = [];
    }
    
    healthContext.additionalInfo.followUpNotes.push({
      date: new Date(),
      update: userInput,
      assessment: aiResponse.progressAssessment,
      aiRecommendations: aiResponse.recommendations
    });

    // Check if should be escalated
    if (aiResponse.urgency === 'high' || aiResponse.shouldSeekCare) {
      healthContext.status = 'escalated';
    }

    await healthContext.save();
    logger.info('Health context updated', {
      contextId: healthContext._id,
      progressAssessment: aiResponse.progressAssessment,
      newSeverity: healthContext.severity
    });
  }

  static async updateCarePlan(healthContext, aiResponse) {
    const carePlan = await CarePlan.findOne({
      contextId: healthContext._id,
      isActive: true
    });

    if (!carePlan) return;

    // Add new recommendations based on progress
    if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
      const newRecommendations = aiResponse.recommendations.map((rec, index) => ({
        type: 'monitoring',
        title: `Follow-up Step ${index + 1}`,
        description: rec,
        priority: 3
      }));

      carePlan.recommendations.push(...newRecommendations);
    }

    // Update next follow-up based on urgency
    const hoursToNextFollowUp = aiResponse.urgency === 'high' ? 12 : 24;
    carePlan.nextFollowUp = new Date(Date.now() + hoursToNextFollowUp * 60 * 60 * 1000);

    await carePlan.save();
    logger.info('Care plan updated', { carePlanId: carePlan._id, urgency: aiResponse.urgency });
  }

  static async generateDailyCareMessage(userId) {
    try {
      const activeContext = await HealthContext.findOne({
        userId,
        status: 'active'
      }).sort({ createdAt: -1 });

      if (!activeContext) {
        return null;
      }

      const daysSince = calculateDaysSince(activeContext.createdAt);
      
      const carePrompt = `
Generate a caring, personalized check-in message for a user dealing with: "${activeContext.primaryConcern}"

This is day ${daysSince} since they first mentioned this concern.
Initial severity was: ${activeContext.severity}/10

Create a brief, warm message that:
1. Shows you remember their specific concern
2. Asks about their current state
3. Is encouraging and supportive
4. Feels personal, not robotic
5. Includes their name if available

Keep it under 50 words and conversational.

Respond in JSON format:
{
  "subject": "Brief email subject line",
  "message": "Your caring check-in message",
  "cta": "Call-to-action text for response button"
}
      `;

      const result = await geminiService.generateContent(carePrompt);
      const response = JSON.parse(result.content);
      
      return {
        subject: response.subject,
        message: response.message,
        cta: response.cta,
        contextId: activeContext._id
      };

    } catch (error) {
      logger.error('Error generating daily care message:', error);
      return null;
    }
  }

  static async generatePersonalizedRecommendations(userId, contextId) {
    try {
      const healthContext = await HealthContext.findById(contextId);
      const carePlan = await CarePlan.findOne({ contextId, isActive: true });

      if (!healthContext) return [];

      const recommendationPrompt = `
Based on a user's health concern: "${healthContext.primaryConcern}"
Symptoms: ${healthContext.symptoms.join(', ')}
Days since initial concern: ${calculateDaysSince(healthContext.createdAt)}

Generate 3-5 personalized recommendation cards that are:
1. Specific to their situation
2. Actionable and practical
3. Evidence-based
4. Encouraging and positive

Focus on lifestyle modifications, self-care, and when to seek help.

Respond in JSON format:
{
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "Detailed explanation (50-100 words)",
      "category": "lifestyle|monitoring|self-care|prevention",
      "priority": "high|medium|low",
      "timeFrame": "immediate|daily|weekly"
    }
  ]
}
      `;

      const result = await geminiService.generateContent(recommendationPrompt);
      const response = JSON.parse(result.content);
      
      return response.recommendations;

    } catch (error) {
      logger.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  static getFallbackFollowUpResponse() {
    return {
      response: "Thank you for the update! I'm here to support you through your health journey.",
      progressAssessment: "unclear",
      recommendations: [
        "Continue monitoring your symptoms",
        "Maintain healthy lifestyle habits",
        "Don't hesitate to seek professional help if needed"
      ],
      nextQuestion: "How are you feeling overall compared to when we first talked?",
      urgency: "medium"
    };
  }
}

module.exports = SecondaryChatbot;