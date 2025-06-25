// backend/src/services/core/sleepDebtService.js
const SleepProfile = require('../../models/SleepProfile');
const SleepEntry = require('../../models/SleepEntry');
const ProductivityPrediction = require('../../models/ProductivityPrediction');
const logger = require('../../utils/logger');

class SleepDebtService {
  
  // Circadian rhythm templates based on chronotype
  static CIRCADIAN_TEMPLATES = {
    morning: [
      0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 1.0, 0.9, // 0-9
      0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2, 0.3, 0.4, // 10-19
      0.5, 0.4, 0.3, 0.2 // 20-23
    ],
    evening: [
      0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, // 0-9
      0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, // 10-19
      0.9, 0.8, 0.6, 0.4 // 20-23
    ],
    intermediate: [
      0.2, 0.1, 0.1, 0.1, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, // 0-9
      1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, // 10-19
      0.6, 0.5, 0.4, 0.3 // 20-23
    ]
  };

  static async calculateSleepDebt(userId, days = 7) {
    try {
      const profile = await SleepProfile.findOne({ userId });
      if (!profile) {
        throw new Error('Sleep profile not found');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sleepEntries = await SleepEntry.find({
        userId,
        date: { $gte: startDate }
      }).sort({ date: -1 });

      if (sleepEntries.length === 0) {
        return {
          totalDebt: 0,
          averageDebt: 0,
          entriesCount: 0,
          lastCalculated: new Date()
        };
      }

      let totalDebt = 0;
      const targetHours = profile.targetSleepHours;

      sleepEntries.forEach(entry => {
        const actualSleep = this.calculateSleepDuration(entry.bedtime, entry.wakeTime);
        const debt = Math.max(0, targetHours - actualSleep);
        totalDebt += debt;
      });

      return {
        totalDebt: Math.round(totalDebt * 100) / 100,
        averageDebt: Math.round((totalDebt / sleepEntries.length) * 100) / 100,
        entriesCount: sleepEntries.length,
        lastCalculated: new Date(),
        targetHours
      };

    } catch (error) {
      logger.error('Error calculating sleep debt:', error);
      throw error;
    }
  }

  static calculateSleepDuration(bedtime, wakeTime) {
    if (!bedtime || !wakeTime) return 0;
    
    const sleep = new Date(bedtime);
    const wake = new Date(wakeTime);
    
    // Handle next day wake time
    if (wake < sleep) {
      wake.setDate(wake.getDate() + 1);
    }
    
    return (wake - sleep) / (1000 * 60 * 60); // hours
  }

  static async generateProductivityCurve(userId, targetDate = new Date()) {
    try {
      const profile = await SleepProfile.findOne({ userId });
      if (!profile) {
        throw new Error('Sleep profile not found');
      }

      // Get sleep debt
      const sleepDebtData = await this.calculateSleepDebt(userId, 7);
      const sleepDebt = sleepDebtData.totalDebt;

      // Get circadian template
      const circadianTemplate = this.CIRCADIAN_TEMPLATES[profile.chronotype];
      
      // Calculate homeostatic pressure (sleep debt factor)
      const homeostaticPressure = this.calculateHomeostaticPressure(sleepDebt);

      // Generate 24-hour curve
      const curve = circadianTemplate.map((circadianLevel, hour) => {
        // Combine Process C (circadian) and Process S (homeostatic)
        const rawProductivity = circadianLevel * (1 - homeostaticPressure);
        const productivity = Math.max(0, Math.min(1, rawProductivity));
        
        return {
          hour,
          productivity: Math.round(productivity * 100) / 100,
          zone: this.categorizeProductivity(productivity),
          circadianFactor: circadianLevel,
          homeostaticFactor: homeostaticPressure
        };
      });

      // Generate recommendations
      const recommendations = this.generateTimeRecommendations(curve);

      // Calculate confidence based on data availability
      const recentEntries = await SleepEntry.countDocuments({
        userId,
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      const confidence = Math.min(1, recentEntries / 7); // Full confidence with 7 days of data

      // Save prediction
      const prediction = new ProductivityPrediction({
        userId,
        date: targetDate,
        sleepDebt,
        curve,
        recommendations,
        confidence
      });

      await prediction.save();

      return {
        sleepDebt,
        curve,
        recommendations,
        confidence,
        metadata: {
          chronotype: profile.chronotype,
          targetSleepHours: profile.targetSleepHours,
          dataPoints: recentEntries
        }
      };

    } catch (error) {
      logger.error('Error generating productivity curve:', error);
      throw error;
    }
  }

  static calculateHomeostaticPressure(sleepDebt) {
    // Convert sleep debt to pressure factor (0-1)
    // More debt = higher pressure = lower productivity
    return Math.min(0.8, sleepDebt / 10); // Cap at 80% reduction
  }

  static categorizeProductivity(productivity) {
    if (productivity >= 0.8) return 'peak';
    if (productivity >= 0.6) return 'high';
    if (productivity >= 0.4) return 'moderate';
    if (productivity >= 0.2) return 'low';
    return 'critical';
  }

  static generateTimeRecommendations(curve) {
    const recommendations = [];
    
    // Find peak productivity windows (>= 0.8 for 2+ consecutive hours)
    let peakStart = null;
    for (let i = 0; i < curve.length; i++) {
      const current = curve[i];
      const next = curve[i + 1];
      
      if (current.productivity >= 0.8 && !peakStart) {
        peakStart = i;
      }
      
      if (peakStart !== null && (!next || next.productivity < 0.8)) {
        const duration = i - peakStart + 1;
        if (duration >= 2) {
          recommendations.push({
            type: 'deep_work',
            timeSlot: { start: peakStart, end: i + 1 },
            priority: 5,
            description: `Peak focus window - ideal for complex, demanding tasks`
          });
        }
        peakStart = null;
      }
    }

    // Find rest periods (low productivity)
    let restStart = null;
    for (let i = 0; i < curve.length; i++) {
      const current = curve[i];
      const next = curve[i + 1];
      
      if (current.productivity <= 0.3 && !restStart) {
        restStart = i;
      }
      
      if (restStart !== null && (!next || next.productivity > 0.3)) {
        const duration = i - restStart + 1;
        if (duration >= 1) {
          recommendations.push({
            type: 'rest',
            timeSlot: { start: restStart, end: i + 1 },
            priority: 2,
            description: `Low energy period - good for breaks or light activities`
          });
        }
        restStart = null;
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  static async createSleepProfile(userId, profileData) {
    try {
      // Check if profile exists
      let profile = await SleepProfile.findOne({ userId });
      
      if (profile) {
        // Update existing profile
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        // Create new profile
        profile = new SleepProfile({
          userId,
          ...profileData
        });
        await profile.save();
      }

      logger.info('Sleep profile created/updated', { userId });
      return profile;

    } catch (error) {
      logger.error('Error creating sleep profile:', error);
      throw error;
    }
  }

  static async logSleepEntry(userId, entryData) {
    try {
      const entry = new SleepEntry({
        userId,
        ...entryData
      });

      await entry.save();

      // Regenerate productivity curve with new data
      await this.generateProductivityCurve(userId);

      logger.info('Sleep entry logged', { userId, date: entryData.date });
      return entry;

    } catch (error) {
      logger.error('Error logging sleep entry:', error);
      throw error;
    }
  }

  static async getSleepInsights(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [profile, entries, debtData] = await Promise.all([
        SleepProfile.findOne({ userId }),
        SleepEntry.find({
          userId,
          date: { $gte: startDate }
        }).sort({ date: -1 }),
        this.calculateSleepDebt(userId, days)
      ]);

      if (!profile || entries.length === 0) {
        return null;
      }

      // Calculate averages
      const avgSleepDuration = entries.reduce((sum, entry) => 
        sum + this.calculateSleepDuration(entry.bedtime, entry.wakeTime), 0
      ) / entries.length;

      const avgQuality = entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / entries.length;
      const avgSleepiness = entries.reduce((sum, entry) => sum + entry.stanfordSleepinessScore, 0) / entries.length;

      // Sleep consistency (bedtime variance)
      const bedtimes = entries.map(entry => entry.bedtime.getHours() + entry.bedtime.getMinutes() / 60);
      const avgBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
      const bedtimeVariance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
      const consistency = Math.max(0, 100 - (Math.sqrt(bedtimeVariance) * 10));

      return {
        profile,
        sleepDebt: debtData,
        averages: {
          sleepDuration: Math.round(avgSleepDuration * 100) / 100,
          sleepQuality: Math.round(avgQuality * 100) / 100,
          sleepinessScore: Math.round(avgSleepiness * 100) / 100,
          consistency: Math.round(consistency)
        },
        trends: null, // Simplified for now
        entriesCount: entries.length
      };

    } catch (error) {
      logger.error('Error getting sleep insights:', error);
      throw error;
    }
  }
}

module.exports = SleepDebtService;