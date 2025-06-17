// ================================
// File: backend/src/routes/health.js
// ================================
const express = require('express');
const { protect } = require('../middleware/auth');
const HealthContext = require('../models/HealthContext');
const CarePlan = require('../models/CarePlan');
const CarePlanService = require('../services/core/carePlanService');
const SecondaryChatbot = require('../services/ai/secondaryChatbot');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Apply protection to all health routes
router.use(protect);

// @route   GET /api/health/contexts
// @desc    Get user's health contexts
// @access  Private
router.get('/contexts', async (req, res, next) => {
  try {
    const { status, limit = 20 } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (status) query.status = status;

    const contexts = await HealthContext.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        contexts,
        count: contexts.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health/contexts/:id
// @desc    Get specific health context
// @access  Private
router.get('/contexts/:id', async (req, res, next) => {
  try {
    const context = await HealthContext.findById(req.params.id);

    if (!context) {
      return next(new AppError('Health context not found', 404));
    }

    // Verify user owns this context
    if (context.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this health context', 403));
    }

    res.json({
      success: true,
      data: { context }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/health/contexts/:id/status
// @desc    Update health context status
// @access  Private
router.put('/contexts/:id/status', async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['active', 'resolved', 'monitoring', 'escalated'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const context = await HealthContext.findById(req.params.id);

    if (!context) {
      return next(new AppError('Health context not found', 404));
    }

    // Verify user owns this context
    if (context.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to modify this health context', 403));
    }

    // Update status
    context.status = status;
    if (status === 'resolved') {
      context.resolutionNotes = notes;
      context.resolvedAt = new Date();
    }

    await context.save();

    logger.info('Health context status updated', {
      userId: req.user._id,
      contextId: context._id,
      newStatus: status
    });

    res.json({
      success: true,
      message: 'Health context status updated',
      data: { context }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health/care-plans
// @desc    Get user's care plans
// @access  Private
router.get('/care-plans', async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user._id;

    const carePlans = await CarePlanService.getUserCarePlans(userId, status);

    res.json({
      success: true,
      data: {
        carePlans,
        count: carePlans.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health/care-plans/:id
// @desc    Get specific care plan
// @access  Private
router.get('/care-plans/:id', async (req, res, next) => {
  try {
    const carePlan = await CarePlan.findById(req.params.id)
      .populate('contextId', 'primaryConcern symptoms status');

    if (!carePlan) {
      return next(new AppError('Care plan not found', 404));
    }
// Verify user owns this care plan
    if (carePlan.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this care plan', 403));
    }

    // Get care plan statistics
    const stats = await CarePlanService.getCarePlanStats(carePlan._id);

    res.json({
      success: true,
      data: {
        carePlan,
        stats
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/health/care-plans/:id/recommendations/:recId/complete
// @desc    Mark a recommendation as completed
// @access  Private
router.put('/care-plans/:id/recommendations/:recId/complete', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const carePlanId = req.params.id;
    const recommendationId = req.params.recId;

    const carePlan = await CarePlan.findById(carePlanId);

    if (!carePlan) {
      return next(new AppError('Care plan not found', 404));
    }

    // Verify user owns this care plan
    if (carePlan.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to modify this care plan', 403));
    }

    const updatedCarePlan = await CarePlanService.completeRecommendation(
      carePlanId,
      recommendationId,
      notes
    );

    logger.info('Recommendation completed', {
      userId: req.user._id,
      carePlanId,
      recommendationId
    });

    res.json({
      success: true,
      message: 'Recommendation marked as completed',
      data: { carePlan: updatedCarePlan }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/health/care-plans/:id/recommendations
// @desc    Add a new recommendation to care plan
// @access  Private
router.post('/care-plans/:id/recommendations', async (req, res, next) => {
  try {
    const { type, title, description, priority, dueDate } = req.body;
    const carePlanId = req.params.id;

    if (!type || !title || !description) {
      return next(new AppError('Type, title, and description are required', 400));
    }

    const carePlan = await CarePlan.findById(carePlanId);

    if (!carePlan) {
      return next(new AppError('Care plan not found', 404));
    }

    // Verify user owns this care plan
    if (carePlan.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to modify this care plan', 403));
    }

    const recommendation = {
      type,
      title,
      description,
      priority: priority || 3,
      dueDate: dueDate ? new Date(dueDate) : null
    };

    const updatedCarePlan = await CarePlanService.addRecommendation(carePlanId, recommendation);

    logger.info('Recommendation added to care plan', {
      userId: req.user._id,
      carePlanId
    });

    res.json({
      success: true,
      message: 'Recommendation added successfully',
      data: { carePlan: updatedCarePlan }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/health/recommendations/generate
// @desc    Generate personalized recommendations
// @access  Private
router.post('/recommendations/generate', async (req, res, next) => {
  try {
    const { contextId } = req.body;

    if (!contextId) {
      return next(new AppError('Health context ID is required', 400));
    }

    // Verify user owns this context
    const context = await HealthContext.findById(contextId);
    if (!context || context.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Health context not found or unauthorized', 404));
    }

    const recommendations = await SecondaryChatbot.generatePersonalizedRecommendations(
      req.user._id,
      contextId
    );

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health/dashboard
// @desc    Get user's health dashboard data
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get active health contexts
    const activeContexts = await HealthContext.findActiveForUser(userId);

    // Get active care plans
    const activeCarePlans = await CarePlanService.getUserCarePlans(userId, 'active');

    // Calculate dashboard statistics
    const stats = {
      activeHealthConcerns: activeContexts.length,
      activeCarePlans: activeCarePlans.length,
      totalRecommendations: activeCarePlans.reduce((total, plan) => total + plan.recommendations.length, 0),
      completedRecommendations: activeCarePlans.reduce((total, plan) => 
        total + plan.recommendations.filter(rec => rec.completed).length, 0
      )
    };

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentContexts = await HealthContext.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        stats,
        activeContexts: activeContexts.slice(0, 5), // Limit to 5 most recent
        activeCarePlans: activeCarePlans.slice(0, 3), // Limit to 3 most recent
        recentActivity: recentContexts
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;