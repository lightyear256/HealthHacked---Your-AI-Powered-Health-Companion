// ================================
// File: backend/src/controllers/authController.js
// ================================
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class AuthController {
  static async register(req, res, next) {
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
  }

  static async login(req, res, next) {
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
  }

  static async getCurrentUser(req, res, next) {
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
  }
}

module.exports = AuthController;