

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_BASE_URL || 'http://localhost:5000'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  // Email configuration
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.FROM_EMAIL || 'HealthHacked <noreply@healthhacked.com>'
  },
  
  // Notification settings
  notifications: {
    intervalHours: parseInt(process.env.NOTIFICATION_INTERVAL_HOURS) || 24,
    defaultTime: '09:00' 
  }
};