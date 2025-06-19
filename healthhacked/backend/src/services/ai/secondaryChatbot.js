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
      
      // Create a structured prompt for JSON response
      const structuredPrompt = `${followUpPrompt}

Respond in this JSON format:
{
  "response": "Your caring follow-up response",
  "progressAssessment": "improving|stable|worsening",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "nextQuestion": "Specific follow-up question",
  "urgency": "low|medium|high"
}`;

      const result = await geminiService.generateStructuredResponse(structuredPrompt);
      const response = result.content; // Already parsed JSON
      
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

Be caring, personal, and show that you remember their situation.`;
  }

  static async updateHealthContext(activeContext, response, userInput) {
    try {
      const updateNote = {
        date: new Date(),
        note: userInput,
        progressAssessment: response.progressAssessment,
        urgency: response.urgency
      };

      activeContext.updates.push(updateNote);
      
      // Update status based on progress
      if (response.progressAssessment === 'worsening' || response.urgency === 'high') {
        activeContext.status = 'urgent';
      } else if (response.progressAssessment === 'improving') {
        activeContext.lastImprovement = new Date();
      }

      await activeContext.save();
      
      logger.info('Health context updated', {
        contextId: activeContext._id,
        progress: response.progressAssessment,
        urgency: response.urgency
      });

    } catch (error) {
      logger.error('Error updating health context:', error);
    }
  }

  static async updateCarePlan(activeContext, response) {
    try {
      const carePlan = await CarePlan.findOne({
        contextId: activeContext._id,
        status: 'active'
      }).sort({ createdAt: -1 });

      if (!carePlan) return;

      // Add new recommendations if provided
      if (response.recommendations && response.recommendations.length > 0) {
        const newRecommendations = response.recommendations.map((rec, index) => ({
          type: 'follow_up',
          title: `Updated Recommendation ${index + 1}`,
          description: rec,
          priority: index + 1,
          addedOn: new Date()
        }));

        carePlan.recommendations.push(...newRecommendations);
        carePlan.lastUpdated = new Date();
        
        await carePlan.save();
        
        logger.info('Care plan updated with new recommendations', {
          carePlanId: carePlan._id,
          newRecommendations: newRecommendations.length
        });
      }

    } catch (error) {
      logger.error('Error updating care plan:', error);
    }
  }

  static getFallbackFollowUpResponse() {
    return {
      response: "Thank you for the update. I'm here to support your health journey. How have you been feeling compared to when we last spoke?",
      progressAssessment: "stable",
      recommendations: [
        "Continue monitoring your symptoms",
        "Maintain healthy habits",
        "Keep a symptom diary if helpful"
      ],
      nextQuestion: "Are there any specific changes or new symptoms you'd like to discuss?",
      urgency: "low"
    };
  }
}

module.exports = SecondaryChatbot;