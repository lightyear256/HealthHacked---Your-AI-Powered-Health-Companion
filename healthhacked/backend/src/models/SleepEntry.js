// backend/src/models/SleepEntry.js
const mongoose = require('mongoose');

const SleepEntrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Core sleep data
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
  sleepDuration: { 
    type: Number, 
    required: true,
    min: 0,
    max: 24 // hours
  },
  
  // Quality and subjective data
  sleepQuality: { 
    type: Number, 
    min: 1, 
    max: 10,
    default: 7
  },
  notes: { 
    type: String, 
    maxLength: 500,
    trim: true
  },
  
  // Calculated sleep debt fields
  sleepDebt: { 
    type: Number, 
    default: 0,
    min: 0
  }, // hours of debt for this specific day
  cumulativeDebt: { 
    type: Number, 
    default: 0,
    min: 0
  }, // running total of sleep debt
  targetSleep: {
    type: Number,
    default: 8 // hours, based on user age/profile
  },
  
  // Contextual information
  isWeekend: { 
    type: Boolean, 
    default: false 
  },
  entryMethod: { 
    type: String, 
    enum: ['manual', 'device', 'estimated'], 
    default: 'manual' 
  },
  
  // Sleep environment factors (optional)
  environment: {
    roomTemperature: { type: Number, min: 50, max: 90 }, // Fahrenheit
    lightExposure: { type: String, enum: ['dark', 'dim', 'bright'] },
    noiseLevel: { type: String, enum: ['quiet', 'moderate', 'loud'] },
    comfort: { type: Number, min: 1, max: 10 }
  },
  
  // Lifestyle factors affecting sleep
  lifestyle: {
    caffeineIntake: { type: Number, default: 0 }, // cups of coffee/tea
    alcoholIntake: { type: Number, default: 0 }, // drinks
    exerciseHours: { type: Number, default: 0 }, // hours before bed
    screenTime: { type: Number, default: 0 }, // hours before bed
    stressLevel: { type: Number, min: 1, max: 10, default: 5 }
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
SleepEntrySchema.index({ userId: 1, date: -1 });

// Pre-save middleware to calculate sleep debt
SleepEntrySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('sleepDuration') || this.isModified('targetSleep')) {
    // Calculate daily sleep debt
    this.sleepDebt = Math.max(0, this.targetSleep - this.sleepDuration);
    
    // Update weekend flag
    const dayOfWeek = new Date(this.date).getDay();
    this.isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    this.updatedAt = new Date();
  }
  next();
});

// Instance method to calculate productivity impact
SleepEntrySchema.methods.getProductivityImpact = function() {
  const debtImpact = Math.min(this.cumulativeDebt * 0.1, 0.5); // Max 50% impact
  const qualityImpact = (10 - this.sleepQuality) * 0.05; // Quality affects 5% per point
  
  return Math.max(0, 1 - debtImpact - qualityImpact);
};

// Static method to get sleep entries for a date range
SleepEntrySchema.statics.getEntriesInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });
};

// Static method to calculate cumulative debt for all entries
SleepEntrySchema.statics.updateCumulativeDebt = async function(userId) {
  const entries = await this.find({ userId }).sort({ date: 1 });
  let cumulativeDebt = 0;
  const DEBT_DECAY_RATE = 0.05; // 5% natural recovery per day
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Add today's debt
    cumulativeDebt += entry.sleepDebt;
    
    // Recovery from surplus sleep
    if (entry.sleepDuration > entry.targetSleep) {
      const surplus = entry.sleepDuration - entry.targetSleep;
      cumulativeDebt = Math.max(0, cumulativeDebt - surplus * 0.5); // 50% recovery efficiency
    }
    
    // Natural decay (body recovers slightly over time)
    cumulativeDebt *= (1 - DEBT_DECAY_RATE);
    
    // Update the entry
    entry.cumulativeDebt = Math.round(cumulativeDebt * 100) / 100;
    await entry.save();
  }
  
  return cumulativeDebt;
};

// Virtual for formatted date
SleepEntrySchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for sleep efficiency
SleepEntrySchema.virtual('sleepEfficiency').get(function() {
  return Math.min(100, (this.sleepDuration / this.targetSleep) * 100);
});

const SleepEntry = mongoose.model('SleepEntry', SleepEntrySchema);

module.exports = SleepEntry;