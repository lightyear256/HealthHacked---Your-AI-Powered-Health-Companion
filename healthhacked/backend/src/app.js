const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const healthRoutes = require('./routes/health');
const drugsRoutes = require('./routes/drugs');
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HealthHacked API',
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'HealthHacked API is working!',
    timestamp: new Date().toISOString(),
    features: [
      'AI-powered health conversations',
      'Health context tracking', 
      'Automated care plan generation',
      'Progress monitoring',
      'Real-time chat history'
    ],
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'POST /api/chat',
      'GET /api/health/dashboard',
      'GET /api/health/contexts',
      'GET /api/health/care-plans'
    ]
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/drugs', drugsRoutes);


// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;