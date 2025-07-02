// const app = require('./src/app');
// const connectDB = require('./src/config/database');
// const logger = require('./src/utils/logger');

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Start server
// const server = app.listen(PORT, () => {
//   logger.info(`🚀 HealthHacked server running on port ${PORT}`);
//   logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   logger.error('Unhandled Promise Rejection:', err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   logger.error('Uncaught Exception:', err);
//   process.exit(1);
// });

console.log('🔍 Starting server.js...');

// Add detailed logging to debug the issue
try {
  console.log('📦 Loading app module...');
  const app = require('./src/app');
  console.log('✅ App loaded successfully:', typeof app);
  console.log('🔍 App properties:', Object.getOwnPropertyNames(app));
  console.log('🔍 App listen function exists:', typeof app.listen);
  
  console.log('📦 Loading database config...');
  const connectDB = require('./src/config/database');
  console.log('✅ Database config loaded');
  
  console.log('📦 Loading logger...');
  const logger = require('./src/utils/logger');
  console.log('✅ Logger loaded');

  const PORT = process.env.PORT || 5000;
  console.log('🔧 PORT:', PORT);

  // Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  connectDB();

  // Check if app is actually an Express app
  if (!app || typeof app.listen !== 'function') {
    console.error('❌ ERROR: App is not a valid Express application!');
    console.error('App type:', typeof app);
    console.error('App value:', app);
    process.exit(1);
  }

  // Start server
  console.log('🚀 Starting server...');
  const server = app.listen(PORT, () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    logger.info(`🚀 HealthHacked server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API Base URL: ${process.env.NODE_ENV === 'production' ? `https://healthhacked-your-ai.onrender.com` : `http://localhost:${PORT}`}/api`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ CRITICAL ERROR in server.js:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
}