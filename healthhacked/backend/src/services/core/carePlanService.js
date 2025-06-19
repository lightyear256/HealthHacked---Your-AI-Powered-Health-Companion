
const CarePlan = require('../../models/CarePlan');
const HealthContext = require('../../models/HealthContext');
const SecondaryChatbot = require('../ai/secondaryChatbot');
const NotificationService = require('../external/notificationService');
const logger = require('../../utils/logger');

class CarePlanService {
  static async createCarePlan(userId, contextId, aiResponse) {
    try {
      const healthContext = await HealthContext.findById(contextId);
      if (!healthContext) {
        throw new Error('Health context not found');
      }

      // Create recommendations from AI response
      const recommendations = [];

      // Add immediate steps
      if (aiResponse.immediateSteps) {
        aiResponse.immediateSteps.forEach((step, index) => {
          recommendations.push({
            type: 'immediate',
            title: `Immediate Step ${index + 1}`,
            description: step,
            priority: index + 1,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in 24 hours
          });
        });
      }

      // Add monitoring recommendations
      if (aiResponse.seekHelpIf) {
        aiResponse.seekHelpIf.forEach((condition, index) => {
          recommendations.push({
            type: 'monitoring',
            title: `Watch for: ${condition}`,
            description: `Monitor for this condition and seek help if it occurs: ${condition}`,
            priority: 3
          });
        });
      }

      const carePlan = new CarePlan({
        userId,
        contextId,
        title: `Care Plan for ${healthContext.primaryConcern}`,
        description: `Personalized care plan to help manage your ${healthContext.primaryConcern}`,
        recommendations
      });

      await carePlan.save();

      // Schedule initial follow-up notifications
      await NotificationService.scheduleFollowUpNotifications(userId);

      logger.info('Care plan created', {
        userId,
        contextId,
        carePlanId: carePlan._id,
        recommendationCount: recommendations.length
      });

      return carePlan;

    } catch (error) {
      logger.error('Error creating care plan:', error);
      throw error;
    }
  }

  static async updateCarePlan(carePlanId, updates) {
    try {
      const carePlan = await CarePlan.findById(carePlanId);
      if (!carePlan) {
        throw new Error('Care plan not found');
      }

      Object.assign(carePlan, updates);
      await carePlan.save();

      logger.info('Care plan updated', { carePlanId, updates });
      return carePlan;

    } catch (error) {
      logger.error('Error updating care plan:', error);
      throw error;
    }
  }

  static async completeRecommendation(carePlanId, recommendationId, notes = '') {
    try {
      const carePlan = await CarePlan.findById(carePlanId);
      if (!carePlan) {
        throw new Error('Care plan not found');
      }

      const recommendation = carePlan.recommendations.id(recommendationId);
      if (!recommendation) {
        throw new Error('Recommendation not found');
      }

      recommendation.completed = true;
      recommendation.completedAt = new Date();
      recommendation.notes = notes;

      await carePlan.save();

      // Check if all recommendations are completed
      const allCompleted = carePlan.recommendations.every(rec => rec.completed);
      if (allCompleted) {
        carePlan.status = 'completed';
        await carePlan.save();

        // Send completion notification
        await this.sendCompletionNotification(carePlan);
      }

      logger.info('Recommendation completed', {
        carePlanId,
        recommendationId,
        allCompleted
      });

      return carePlan;

    } catch (error) {
      logger.error('Error completing recommendation:', error);
      throw error;
    }
  }

  static async addRecommendation(carePlanId, recommendation) {
    try {
      const carePlan = await CarePlan.findById(carePlanId);
      if (!carePlan) {
        throw new Error('Care plan not found');
      }

      carePlan.recommendations.push(recommendation);
      await carePlan.save();

      logger.info('Recommendation added to care plan', { carePlanId });
      return carePlan;

    } catch (error) {
      logger.error('Error adding recommendation:', error);
      throw error;
    }
  }

  static async generatePersonalizedRecommendations(userId, contextId) {
    try {
      const recommendations = await SecondaryChatbot.generatePersonalizedRecommendations(userId, contextId);
      
      const carePlan = await CarePlan.findOne({ contextId, isActive: true });
      if (carePlan) {
        // Add new recommendations to existing care plan
        const newRecommendations = recommendations.map(rec => ({
          type: rec.category === 'lifestyle' ? 'lifestyle' : 'monitoring',
          title: rec.title,
          description: rec.description,
          priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
          dueDate: rec.timeFrame === 'immediate' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
        }));

        carePlan.recommendations.push(...newRecommendations);
        await carePlan.save();

        logger.info('Personalized recommendations added', {
          carePlanId: carePlan._id,
          newRecommendationCount: newRecommendations.length
        });

        return carePlan;
      }

      return null;

    } catch (error) {
      logger.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  static async sendCompletionNotification(carePlan) {
    try {
      await NotificationService.notificationQueue.add('care-completion', {
        userId: carePlan.userId.toString(),
        carePlanId: carePlan._id.toString(),
        message: `Congratulations! You've completed your care plan for ${carePlan.title}`
      }, {
        attempts: 3,
        backoff: 'exponential'
      });

    } catch (error) {
      logger.error('Error sending completion notification:', error);
    }
  }

  static async getUserCarePlans(userId, status = null) {
    try {
      const query = { userId, isActive: true };
      if (status) {
        query.status = status;
      }

      const carePlans = await CarePlan.find(query)
        .populate('contextId', 'primaryConcern symptoms status')
        .sort({ createdAt: -1 });

      return carePlans;

    } catch (error) {
      logger.error('Error getting user care plans:', error);
      throw error;
    }
  }

  static async getCarePlanStats(carePlanId) {
    try {
      const carePlan = await CarePlan.findById(carePlanId);
      if (!carePlan) {
        throw new Error('Care plan not found');
      }

      const totalRecommendations = carePlan.recommendations.length;
      const completedRecommendations = carePlan.recommendations.filter(rec => rec.completed).length;
      const overduerecommendations = carePlan.recommendations.filter(rec => 
        !rec.completed && rec.dueDate && rec.dueDate < new Date()
      ).length;

      return {
        totalRecommendations,
        completedRecommendations,
        pendingRecommendations: totalRecommendations - completedRecommendations,
        overdueRecommendations,
        completionPercentage: Math.round((completedRecommendations / totalRecommendations) * 100),
        isOverdue: carePlan.isOverdue,
        status: carePlan.status
      };

    } catch (error) {
      logger.error('Error getting care plan stats:', error);
      throw error;
    }
  }
}

module.exports = CarePlanService;