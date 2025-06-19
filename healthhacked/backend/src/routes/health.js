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

// @route   GET /api/health/dashboard
// @desc    Get user's health dashboard data
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id;

    logger.info('Loading dashboard data', { userId });

    // Get active health contexts
    const activeContexts = await HealthContext.find({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 }).limit(5);

    // Get active care plans
    const activeCarePlans = await CarePlan.find({
      userId,
      isActive: true
    }).populate('contextId', 'primaryConcern symptoms status').limit(3);

    // Calculate dashboard statistics
    const stats = {
      activeHealthConcerns: activeContexts.length,
      activeCarePlans: activeCarePlans.length,
      totalRecommendations: activeCarePlans.reduce((total, plan) => total + (plan.recommendations?.length || 0), 0),
      completedRecommendations: activeCarePlans.reduce((total, plan) => 
        total + (plan.recommendations?.filter(rec => rec.completed).length || 0), 0
      )
    };

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await HealthContext.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);

    logger.info('Dashboard data loaded successfully', {
      userId,
      activeContexts: activeContexts.length,
      activeCarePlans: activeCarePlans.length
    });

    res.json({
      success: true,
      data: {
        stats,
        activeContexts,
        activeCarePlans,
        recentActivity
      }
    });

  } catch (error) {
    logger.error('Dashboard load error', { userId: req.user._id, error: error.message });
    next(error);
  }
});

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

    const query = { userId, isActive: true };
    if (status) {
      query.status = status;
    }

    const carePlans = await CarePlan.find(query)
      .populate('contextId', 'primaryConcern symptoms status')
      .sort({ createdAt: -1 });

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

    res.json({
      success: true,
      data: {
        carePlan
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/health/care-plans/:id/recommendations/:recId/complete
// @desc    Mark a recommendation as completed
// @access  Private
router.put('/care-plans/:carePlanId/recommendations/:recId/complete', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const { carePlanId, recId } = req.params;

    const carePlan = await CarePlan.findById(carePlanId);

    if (!carePlan) {
      return next(new AppError('Care plan not found', 404));
    }

    // Verify user owns this care plan
    if (carePlan.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this care plan', 403));
    }

    // Find and update the recommendation
    const recommendation = carePlan.recommendations.id(recId);
    if (!recommendation) {
      return next(new AppError('Recommendation not found', 404));
    }

    recommendation.completed = true;
    recommendation.completedAt = new Date();
    if (notes) recommendation.notes = notes;

    await carePlan.save();

    logger.info('Recommendation completed', {
      userId: req.user._id,
      carePlanId,
      recommendationId: recId
    });

    res.json({
      success: true,
      message: 'Recommendation completed successfully',
      data: { carePlan }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;