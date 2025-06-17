// ================================
// File: backend/src/routes/auth.js
// ================================
const express = require('express');
const bcrypt = require('bcryptjs');
const { protect, generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const NotificationService = require('../services/external/notificationService');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { email, password, name, age, gender, timezone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = new User({
      email,
      password,
      profile: {
        name,
        age,
        gender,
        timezone: timezone || 'UTC'
      }
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Schedule initial notifications
    await NotificationService.scheduleFollowUpNotifications(user._id);

    logger.info('User registered successfully', { userId: user._id, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Update last active
    await user.updateLastActive();

    // Generate JWT token
    const token = generateToken(user._id);

    logger.info('User logged in successfully', { userId: user._id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          lastActive: user.lastActive
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('activeHealthContexts', 'primaryConcern status severity createdAt');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          lastActive: user.lastActive,
          activeHealthContexts: user.activeHealthContexts
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, age, gender, timezone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Update profile fields if provided
    if (name) user.profile.name = name;
    if (age) user.profile.age = age;
    if (gender) user.profile.gender = gender;
    if (timezone) user.profile.timezone = timezone;

    await user.save();

    logger.info('User profile updated', { userId: user._id });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res, next) => {
  try {
    const { notificationTime, followUpFrequency, emailNotifications } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Update preferences if provided
    if (notificationTime) user.preferences.notificationTime = notificationTime;
    if (followUpFrequency) user.preferences.followUpFrequency = followUpFrequency;
    if (typeof emailNotifications === 'boolean') {
      user.preferences.emailNotifications = emailNotifications;
      
      // Cancel or reschedule notifications based on preference
      if (emailNotifications) {
        await NotificationService.scheduleFollowUpNotifications(user._id);
      } else {
        await NotificationService.cancelUserNotifications(user._id);
      }
    }

    await user.save();

    logger.info('User preferences updated', { userId: user._id });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isCurrentPasswordMatch = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('User password changed', { userId: user._id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;