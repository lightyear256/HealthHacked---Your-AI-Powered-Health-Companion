// // ================================
// // File: backend/src/app.js
// // ================================
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// // Import middleware
// const errorHandler = require('./middleware/errorHandler');
// const { notFound } = require('./middleware/errorHandler');

// // Import routes
// const authRoutes = require('./routes/auth');
// const chatRoutes = require('./routes/chat');
// const healthRoutes = require('./routes/health');
// const notificationRoutes = require('./routes/notifications');

// const app = express();

// // Security middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Compression middleware
// app.use(compression());

// // Logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     service: 'HealthHacked API',
//     version: '1.0.0'
//   });
// });

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/health', healthRoutes);
// app.use('/api/notifications', notificationRoutes);

// // 404 handler
// app.use(notFound);

// // Error handling middleware (must be last)
// app.use(errorHandler);

// module.exports = app;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
 require('dotenv').config();
// app.use('/api/chat', require('./routes/chat'));
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthhacked')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

app.use('/api/chat', require('./routes/chat'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HealthHacked API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

module.exports = app;