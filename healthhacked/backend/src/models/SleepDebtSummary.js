    // backend/src/models/SleepDebtSummary.js
const mongoose = require('mongoose');

const SleepDebtSummarySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Time period this summary covers
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  periodStart: { 
    type: Date, 
    required: true 
  },
  periodEnd: { 
    type: Date, 
    required: true 
  },
  
  // Sleep debt metrics
  totalDebt: { 
    type: Number, 
    default: 0,
    min: 0
  },
  averageDebt: { 
    type: Number, 
    default: 0,
    min: 0
  },
  maxDebt: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Sleep quality metrics
  averageSleep: { 
    type: Number, 
    default: 0,
    min: 0
  },
  averageQuality: { 
    type: Number, 
    default: 0,
    min: 1,
    max: 10
  },
  sleepEfficiency: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  
  // Trend analysis
  debtTrend: { 
    type: String, 
    enum: ['improving', 'worsening', 'stable', 'insufficient_data'],
    default: 'insufficient_data'
  },
  qualityTrend: { 
    type: String, 
    enum: ['improving', 'worsening', 'stable', 'insufficient_data'],
    default: 'insufficient_data'
  },
  consistencyScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0 // 0 = very inconsistent, 1 = very consistent
  },
  
  // Insights and recommendations
  insights: [{
    type: {
      type: String,
      enum: ['debt', 'quality', 'consistency', 'pattern', 'chronotype']
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'critical']
    },
    title: String,
    description: String,
    actionable: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  
  recommendations: [{
    title: String,
    steps: [String],
    timeframe: String,
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }],
  
  // Statistical data
  statistics: {
    totalEntries: { type: Number, default: 0 },
    missedEntries: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // percentage
    
    // Sleep patterns
    averageBedtime: String, // "22:30"
    averageWakeTime: String, // "07:00"
    mostCommonSleepDuration: Number,
    
    // Lifestyle correlations
    bestQualityFactors: [String],
    worstQualityFactors: [String]
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

// Compound indexes for efficient queries
SleepDebtSummarySchema.index({ userId: 1, periodType: 1, periodStart: -1 });
SleepDebtSummarySchema.index({ userId: 1, createdAt: -1 });

// Static method to generate summary for a user and period
SleepDebtSummarySchema.statics.generateSummary = async function(userId, periodType, startDate, endDate) {
  const SleepEntry = require('./SleepEntry');
  
  // Get all sleep entries for the period
  const entries = await SleepEntry.getEntriesInRange(userId, startDate, endDate);
  
  if (entries.length === 0) {
    return null; // No data to summarize
  }
  
  // Calculate basic metrics
  const totalDebt = entries.reduce((sum, entry) => sum + entry.sleepDebt, 0);
  const averageDebt = totalDebt / entries.length;
  const maxDebt = Math.max(...entries.map(entry => entry.sleepDebt));
  
  const averageSleep = entries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / entries.length;
  const averageQuality = entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / entries.length;
  
  // Calculate sleep efficiency
  const totalTarget = entries.reduce((sum, entry) => sum + entry.targetSleep, 0);
  const totalActual = entries.reduce((sum, entry) => sum + entry.sleepDuration, 0);
  const sleepEfficiency = (totalActual / totalTarget) * 100;
  
  // Calculate consistency score (based on standard deviation of sleep times)
  const sleepDurations = entries.map(entry => entry.sleepDuration);
  const stdDev = calculateStandardDeviation(sleepDurations);
  const consistencyScore = Math.max(0, 1 - (stdDev / 3)); // Normalize to 0-1
  
  // Determine trends
  const debtTrend = calculateTrend(entries.map(entry => entry.sleepDebt));
  const qualityTrend = calculateTrend(entries.map(entry => entry.sleepQuality));
  
  // Generate insights and recommendations
  const insights = generateInsights(entries, {
    averageDebt,
    averageQuality,
    consistencyScore,
    sleepEfficiency
  });
  
  const recommendations = generateRecommendations(insights);
  
  // Calculate statistics
  const statistics = calculateStatistics(entries);
  
  // Create or update summary
  const summary = await this.findOneAndUpdate(
    { 
      userId, 
      periodType, 
      periodStart: startDate,
      periodEnd: endDate
    },
    {
      userId,
      periodType,
      periodStart: startDate,
      periodEnd: endDate,
      totalDebt,
      averageDebt,
      maxDebt,
      averageSleep,
      averageQuality,
      sleepEfficiency,
      debtTrend,
      qualityTrend,
      consistencyScore,
      insights,
      recommendations,
      statistics,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true 
    }
  );
  
  return summary;
};

// Helper functions
function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculateTrend(values) {
  if (values.length < 3) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  const threshold = 0.1; // Minimum change to consider a trend
  
  if (Math.abs(diff) < threshold) return 'stable';
  return diff > 0 ? 'worsening' : 'improving';
}

function generateInsights(entries, metrics) {
  const insights = [];
  
  // High sleep debt warning
  if (metrics.averageDebt > 2) {
    insights.push({
      type: 'debt',
      level: metrics.averageDebt > 5 ? 'critical' : 'warning',
      title: 'High Sleep Debt Detected',
      description: `Your average sleep debt is ${metrics.averageDebt.toFixed(1)} hours. This significantly impacts cognitive function and health.`,
      actionable: 'Plan recovery sleep and improve sleep consistency',
      impact: metrics.averageDebt > 5 ? 'critical' : 'high'
    });
  }
  
  // Poor sleep quality
  if (metrics.averageQuality < 6) {
    insights.push({
      type: 'quality',
      level: 'warning',
      title: 'Low Sleep Quality',
      description: `Your average sleep quality rating is ${metrics.averageQuality.toFixed(1)}/10. Consider optimizing your sleep environment.`,
      actionable: 'Review sleep hygiene practices and environment factors',
      impact: 'medium'
    });
  }
  
  // Inconsistent sleep schedule
  if (metrics.consistencyScore < 0.7) {
    insights.push({
      type: 'consistency',
      level: 'warning',
      title: 'Inconsistent Sleep Schedule',
      description: 'Your sleep times vary significantly, which can disrupt your circadian rhythm.',
      actionable: 'Establish and maintain consistent bedtime and wake times',
      impact: 'high'
    });
  }
  
  // Low sleep efficiency
  if (metrics.sleepEfficiency < 85) {
    insights.push({
      type: 'pattern',
      level: 'info',
      title: 'Sleep Efficiency Could Improve',
      description: `Your sleep efficiency is ${metrics.sleepEfficiency.toFixed(1)}%. Aim for 85% or higher.`,
      actionable: 'Optimize sleep duration to match your natural needs',
      impact: 'medium'
    });
  }
  
  return insights;
}

function generateRecommendations(insights) {
  const recommendations = [];
  
  insights.forEach(insight => {
    switch(insight.type) {
      case 'debt':
        recommendations.push({
          title: 'Sleep Debt Recovery Plan',
          steps: [
            'Go to bed 30-60 minutes earlier tonight',
            'Aim for 8.5-9 hours sleep this weekend',
            'Avoid caffeine after 2 PM',
            'Create a consistent wind-down routine'
          ],
          timeframe: '1-2 weeks',
          priority: 5
        });
        break;
        
      case 'quality':
        recommendations.push({
          title: 'Sleep Quality Optimization',
          steps: [
            'Keep bedroom temperature between 65-68°F',
            'Use blackout curtains or eye mask',
            'Limit screen time 1 hour before bed',
            'Consider white noise or earplugs'
          ],
          timeframe: '1 week',
          priority: 4
        });
        break;
        
      case 'consistency':
        recommendations.push({
          title: 'Schedule Consistency Building',
          steps: [
            'Set a fixed bedtime alarm',
            'Use morning light exposure',
            'Avoid large meals 3 hours before bed',
            'Create a relaxing bedtime routine'
          ],
          timeframe: '2-4 weeks',
          priority: 4
        });
        break;
    }
  });
  
  return recommendations;
}

function calculateStatistics(entries) {
  // Calculate average bed/wake times
  const bedtimes = entries.map(entry => {
    const time = new Date(entry.bedtime);
    return time.getHours() + time.getMinutes() / 60;
  });
  
  const waketimes = entries.map(entry => {
    const time = new Date(entry.wakeTime);
    return time.getHours() + time.getMinutes() / 60;
  });
  
  const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
  const avgWaketime = waketimes.reduce((sum, time) => sum + time, 0) / waketimes.length;
  
  // Convert back to time format
  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  return {
    totalEntries: entries.length,
    completionRate: 100, // Since we only have entries that exist
    averageBedtime: formatTime(avgBedtime),
    averageWakeTime: formatTime(avgWaketime),
    mostCommonSleepDuration: mode(entries.map(entry => Math.round(entry.sleepDuration * 2) / 2))
  };
}

function mode(arr) {
  const frequency = {};
  let maxFreq = 0;
  let mode = arr[0];
  
  arr.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });
  
  return mode;
}

const SleepDebtSummary = mongoose.model('SleepDebtSummary', SleepDebtSummarySchema);

module.exports = SleepDebtSummary;