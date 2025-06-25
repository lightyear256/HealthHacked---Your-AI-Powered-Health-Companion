// backend/src/models/ProductivityPrediction.js
const mongoose = require('mongoose');

const productivityPredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  sleepDebt: {
    type: Number,
    default: 0
  },
  curve: [{
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    productivity: {
      type: Number,
      min: 0,
      max: 1
    },
    zone: {
      type: String,
      enum: ['peak', 'high', 'moderate', 'low', 'critical']
    },
    circadianFactor: Number,
    homeostaticFactor: Number
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['deep_work', 'creative', 'routine', 'rest', 'exercise']
    },
    timeSlot: {
      start: Number, // hour
      end: Number    // hour
    },
    priority: {
      type: Number,
      min: 1,
      max: 5
    },
    description: String
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
productivityPredictionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ProductivityPrediction', productivityPredictionSchema);