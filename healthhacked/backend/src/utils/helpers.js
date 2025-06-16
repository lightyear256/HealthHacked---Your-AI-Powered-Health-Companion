// ================================
// File: backend/src/utils/helpers.js
// ================================
const crypto = require('crypto');

// Generate unique session ID
const generateSessionId = () => {
  return crypto.randomUUID();
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Calculate days between dates
const calculateDaysSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffTime = Math.abs(now - then);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Extract symptoms from user input using basic NLP
const extractSymptoms = (text) => {
  const symptomsKeywords = [
    'headache', 'fever', 'cough', 'fatigue', 'nausea', 'pain', 'ache',
    'dizzy', 'tired', 'weak', 'sore', 'hurt', 'sick', 'ill'
  ];
  
  const lowercaseText = text.toLowerCase();
  return symptomsKeywords.filter(symptom => 
    lowercaseText.includes(symptom)
  );
};

// Map severity levels
const mapSeverity = (severityString) => {
  const severityMap = {
    'low': 1,
    'mild': 2,
    'medium': 3,
    'moderate': 4,
    'high': 5,
    'severe': 6,
    'critical': 7
  };
  
  return severityMap[severityString.toLowerCase()] || 3;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

module.exports = {
  generateSessionId,
  generateRandomString,
  calculateDaysSince,
  extractSymptoms,
  mapSeverity,
  isValidEmail,
  sanitizeInput
};