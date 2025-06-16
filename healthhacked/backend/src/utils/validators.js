// ================================
// File: backend/src/utils/validators.js
// ================================
const validator = require('validator');

class Validators {
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  static isValidName(name) {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
  }

  static isValidAge(age) {
    return Number.isInteger(age) && age >= 1 && age <= 120;
  }

  static isValidGender(gender) {
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
    return validGenders.includes(gender.toLowerCase());
  }

  static isValidTimezone(timezone) {
    try {
      Intl.DateTimeFormat(undefined, {timeZone: timezone});
      return true;
    } catch (ex) {
      return false;
    }
  }

  static isValidTime(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static isValidFrequency(frequency) {
    const validFrequencies = ['daily', 'weekly', 'monthly', 'never'];
    return validFrequencies.includes(frequency.toLowerCase());
  }

  static sanitizeMessage(message) {
    if (!message || typeof message !== 'string') return '';
    
    return message
      .trim()
      .substring(0, 1000) // Limit message length
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }
}

module.exports = Validators;