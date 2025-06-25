const express = require('express');
const { protect } = require('../middleware/auth');
const SleepDebtService = require('../services/core/sleepDebtService');
const SleepProfile = require('../models/SleepProfile');
const SleepEntry = require('../models/SleepEntry');
const ProductivityPrediction = require('../models/ProductivityPrediction');
const { AppError } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router = express.Router();

// Apply protection to all sleep routes
router.use(protect);

// @route   GET /api/sleep/dashboard
// @desc    Get sleep dashboard data
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id;

    logger.info('Loading sleep dashboard', { userId });

    // Get current productivity curve
    let todaysPrediction = await ProductivityPrediction.findOne({
      userId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    // Generate if doesn't exist
    if (!todaysPrediction) {
      try {
        const curveData = await SleepDebtService.generateProductivityCurve(userId);
        todaysPrediction = {
          sleepDebt: curveData.sleepDebt,
          curve: curveData.curve,
          recommendations: curveData.recommendations,
          confidence: curveData.confidence
        };
      } catch (error) {
        // If no profile exists, return setup needed
        return res.json({
          success: true,
          data: null,
          message: 'Sleep profile setup required'
        });
      }
    }

    // Get sleep insights
    const insights = await SleepDebtService.getSleepInsights(userId, 30);

    // Get recent sleep entries
    const recentEntries = await SleepEntry.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    // Calculate current hour productivity
    const currentHour = new Date().getHours();
    const currentProductivity = todaysPrediction.curve[currentHour];

    res.json({
      success: true,
      data: {
        currentProductivity,
        sleepDebt: todaysPrediction.sleepDebt,
        productivity: {
          curve: todaysPrediction.curve,
          recommendations: todaysPrediction.recommendations,
          confidence: todaysPrediction.confidence
        },
        insights,
        recentEntries: recentEntries.slice(0, 5),
        stats: {
          entriesLogged: recentEntries.length,
          avgSleepDebt: insights?.sleepDebt?.averageDebt || 0,
          consistency: insights?.averages?.consistency || 0
        }
      }
    });

  } catch (error) {
    logger.error('Sleep dashboard error:', error);
    next(error);
  }
});

// @route   GET /api/sleep/profile
// @desc    Get user's sleep profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await SleepProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.json({
        success: true,
        data: null,
        message: 'No sleep profile found. Please set up your sleep preferences.'
      });
    }

    res.json({
      success: true,
      data: { profile }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sleep/profile
// @desc    Create or update sleep profile
// @access  Private
router.post('/profile', [
  body('chronotype').isIn(['morning', 'evening', 'intermediate']),
  body('weekdayBedtime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('weekdayWakeTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('targetSleepHours').isFloat({ min: 4, max: 12 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400, errors.array()));
    }

    const profileData = req.body;
    const profile = await SleepDebtService.createSleepProfile(req.user._id, profileData);

    // Generate initial productivity curve
    await SleepDebtService.generateProductivityCurve(req.user._id);

    logger.info('Sleep profile created/updated', { userId: req.user._id });

    res.json({
      success: true,
      data: { profile },
      message: 'Sleep profile updated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sleep/entry
// @desc    Log a sleep entry
// @access  Private
router.post('/entry', [
  body('date').isISO8601(),
  body('bedtime').isISO8601(),
  body('wakeTime').isISO8601(),
  body('sleepQuality').isInt({ min: 1, max: 10 }),
  body('stanfordSleepinessScore').optional().isInt({ min: 1, max: 7 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400, errors.array()));
    }

    const entryData = {
      ...req.body,
      date: new Date(req.body.date),
      bedtime: new Date(req.body.bedtime),
      wakeTime: new Date(req.body.wakeTime)
    };

    const entry = await SleepDebtService.logSleepEntry(req.user._id, entryData);

    logger.info('Sleep entry logged', { 
      userId: req.user._id, 
      date: entryData.date,
      duration: SleepDebtService.calculateSleepDuration(entryData.bedtime, entryData.wakeTime)
    });

    res.status(201).json({
      success: true,
      data: { entry },
      message: 'Sleep entry logged successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sleep/entries
// @desc    Get user's sleep entries
// @access  Private
router.get('/entries', async (req, res, next) => {
  try {
    const { limit = 30, startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await SleepEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        entries,
        count: entries.length
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sleep/debt
// @desc    Get current sleep debt
// @access  Private
router.get('/debt', async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const debtData = await SleepDebtService.calculateSleepDebt(req.user._id, parseInt(days));

    res.json({
      success: true,
      data: debtData
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;