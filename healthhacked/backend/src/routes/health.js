const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Simple auth middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// @route   GET /api/health/dashboard
// @desc    Get user's health dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    console.log('📊 Dashboard request for user:', req.user._id);
    
    // Mock dashboard data for now - replace with real data later
    const dashboardData = {
      stats: {
        activeHealthConcerns: 0,
        activeCarePlans: 0,
        totalRecommendations: 0,
        completedRecommendations: 0
      },
      activeContexts: [],
      activeCarePlans: [],
      recentActivity: []
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data'
    });
  }
});

// @route   GET /api/health/contexts
// @desc    Get user's health contexts
// @access  Private
router.get('/contexts', protect, async (req, res) => {
  try {
    console.log('📋 Health contexts request for user:', req.user._id);
    
    // Mock data for now
    res.json({
      success: true,
      data: {
        contexts: [],
        count: 0
      }
    });

  } catch (error) {
    console.error('Health contexts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load health contexts'
    });
  }
});

// @route   GET /api/health/care-plans
// @desc    Get user's care plans
// @access  Private
router.get('/care-plans', protect, async (req, res) => {
  try {
    console.log('📋 Care plans request for user:', req.user._id);
    
    // Mock data for now
    res.json({
      success: true,
      data: {
        carePlans: [],
        count: 0
      }
    });

  } catch (error) {
    console.error('Care plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load care plans'
    });
  }
});

// @route   GET /api/health/contexts/:id
// @desc    Get specific health context
// @access  Private
router.get('/contexts/:id', protect, async (req, res) => {
  try {
    console.log('📋 Health context request:', req.params.id);
    
    // Mock data for now
    res.json({
      success: true,
      data: {
        context: {
          _id: req.params.id,
          primaryConcern: 'Sample Health Concern',
          severity: 5,
          symptoms: ['symptom1', 'symptom2'],
          status: 'active',
          createdAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Health context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load health context'
    });
  }
});

// @route   PUT /api/health/contexts/:id/status
// @desc    Update health context status
// @access  Private
router.put('/contexts/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    console.log('📝 Updating context status:', req.params.id, status);
    
    // Mock update for now
    res.json({
      success: true,
      message: 'Health context status updated',
      data: {
        context: {
          _id: req.params.id,
          status: status,
          notes: notes
        }
      }
    });

  } catch (error) {
    console.error('Update context status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update health context status'
    });
  }
});

// @route   GET /api/health/care-plans/:id
// @desc    Get specific care plan
// @access  Private
router.get('/care-plans/:id', protect, async (req, res) => {
  try {
    console.log('📋 Care plan request:', req.params.id);
    
    // Mock data for now
    res.json({
      success: true,
      data: {
        carePlan: {
          _id: req.params.id,
          title: 'Sample Care Plan',
          description: 'Sample care plan description',
          status: 'active',
          recommendations: [],
          contextId: {
            _id: 'context1',
            primaryConcern: 'Sample Concern'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Care plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load care plan'
    });
  }
});

// @route   PUT /api/health/care-plans/:id/recommendations/:recId/complete
// @desc    Mark a recommendation as completed
// @access  Private
router.put('/care-plans/:carePlanId/recommendations/:recId/complete', protect, async (req, res) => {
  try {
    const { notes } = req.body;
    console.log('✅ Completing recommendation:', req.params.recId);
    
    // Mock completion for now
    res.json({
      success: true,
      message: 'Recommendation completed successfully',
      data: {
        recommendation: {
          _id: req.params.recId,
          completed: true,
          completedAt: new Date(),
          notes: notes
        }
      }
    });

  } catch (error) {
    console.error('Complete recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete recommendation'
    });
  }
});

module.exports = router;