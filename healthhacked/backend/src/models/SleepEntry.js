// backend/src/models/SleepEntry.js
const mongoose = require('mongoose');

const sleepEntrySchema = new mongoose.Schema({
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
  bedtime: {
    type: Date,
    required: true
  },
  wakeTime: {
    type: Date,
    required: true
  },
  sleepQuality: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  stanfordSleepinessScore: {
    type: Number,
    min: 1,
    max: 7,
    default: 4
  },
  productivitySelfReport: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor', 'terrible'],
    default: 'average'
  },
  caffeine: {
    consumed: { type: Boolean, default: false },
    amount: { type: Number, min: 0 }, // mg
    lastIntake: { type: Date }
  },
  exercise: {
    type: Boolean,
    default: false
  },
  stress: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
sleepEntrySchema.index({ userId: 1, date: -1 });

// Calculate sleep duration
sleepEntrySchema.virtual('sleepDuration').get(function() {
  if (this.bedtime && this.wakeTime) {
    return (this.wakeTime - this.bedtime) / (1000 * 60 * 60); // hours
  }
  return 0;
});

// Calculate sleep debt for this entry
sleepEntrySchema.methods.calculateDebt = function(targetHours) {
  const actualSleep = this.sleepDuration;
  return Math.max(0, targetHours - actualSleep);
};

module.exports = mongoose.model('SleepEntry', sleepEntrySchema);