// const express = require('express');
// const router = express.Router();
// const SleepEntry = require('../models/SleepEntry');
// const SleepDebtSummary = require('../models/SleepDebtSummary');
// const { authenticateToken } = require('../middleware/auth');
// const { body, validationResult, query } = require('express-validator');
// const logger = require('../utils/logger');

// // Apply authentication to all routes
// router.use(authenticateToken);

// // Validation middleware
// const validateSleepEntry = [
//   body('date').isISO8601().toDate(),
//   body('bedtime').isISO8601().toDate(),
//   body('wakeTime').isISO8601().toDate(),
//   body('sleepQuality').optional().isInt({ min: 1, max: 10 }),
//   body('notes').optional().isLength({ max: 500 }),
//   body('targetSleep').optional().isFloat({ min: 4, max: 12 }),
// ];

// const validateDateRange = [
//   query('startDate').optional().isISO8601().toDate(),
//   query('endDate').optional().isISO8601().toDate(),
// ];

// // Helper function to calculate sleep duration
// function calculateSleepDuration(bedtime, wakeTime) {
//   const bedtimeMs = new Date(bedtime).getTime();
//   let wakeTimeMs = new Date(wakeTime).getTime();
  
//   // Handle next-day wake times
//   if (wakeTimeMs <= bedtimeMs) {
//     wakeTimeMs += 24 * 60 * 60 * 1000; // Add 24 hours
//   }
  
//   return (wakeTimeMs - bedtimeMs) / (1000 * 60 * 60); // Convert to hours
// }

// // POST /api/sleep/entries - Create a new sleep entry
// router.post('/entries', validateSleepEntry, async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const { date, bedtime, wakeTime, sleepQuality, notes, targetSleep } = req.body;
//     const userId = req.user.id;

//     // Calculate sleep duration
//     const sleepDuration = calculateSleepDuration(bedtime, wakeTime);
    
//     if (sleepDuration <= 0 || sleepDuration > 24) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid sleep duration calculated'
//       });
//     }

//     // Check if entry already exists for this date
//     const existingEntry = await SleepEntry.findOne({
//       userId,
//       date: {
//         $gte: new Date(date).setHours(0, 0, 0, 0),
//         $lt: new Date(date).setHours(23, 59, 59, 999)
//       }
//     });

//     if (existingEntry) {
//       return res.status(409).json({
//         success: false,
//         message: 'Sleep entry already exists for this date'
//       });
//     }

//     // Get user's default target sleep (you might want to fetch from user profile)
//     const defaultTargetSleep = targetSleep || 8;

//     // Create new sleep entry
//     const sleepEntry = new SleepEntry({
//       userId,
//       date: new Date(date),
//       bedtime: new Date(bedtime),
//       wakeTime: new Date(wakeTime),
//       sleepDuration,
//       sleepQuality: sleepQuality || 7,
//       notes: notes || '',
//       targetSleep: defaultTargetSleep
//     });

//     await sleepEntry.save();

//     // Update cumulative debt for all user entries
//     await SleepEntry.updateCumulativeDebt(userId);

//     logger.info('Sleep entry created', { 
//       userId, 
//       date: sleepEntry.formattedDate,
//       duration: sleepDuration,
//       debt: sleepEntry.sleepDebt
//     });

//     res.status(201).json({
//       success: true,
//       data: sleepEntry,
//       message: 'Sleep entry created successfully'
//     });

//   } catch (error) {
//     logger.error('Error creating sleep entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create sleep entry'
//     });
//   }
// });

// // GET /api/sleep/entries - Get sleep entries with optional date range
// router.get('/entries', validateDateRange, async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const userId = req.user.id;
//     const { startDate, endDate, limit = 30 } = req.query;

//     let query = { userId };

//     // Add date range filter if provided
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) query.date.$lte = new Date(endDate);
//     }

//     const entries = await SleepEntry.find(query)
//       .sort({ date: -1 })
//       .limit(parseInt(limit));

//     // Calculate summary statistics
//     const totalEntries = entries.length;
//     const averageSleep = totalEntries > 0 
//       ? entries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / totalEntries 
//       : 0;
//     const averageQuality = totalEntries > 0 
//       ? entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / totalEntries 
//       : 0;
//     const currentDebt = totalEntries > 0 ? entries[0].cumulativeDebt : 0;

//     res.json({
//       success: true,
//       data: {
//         entries,
//         summary: {
//           totalEntries,
//           averageSleep: Math.round(averageSleep * 100) / 100,
//           averageQuality: Math.round(averageQuality * 100) / 100,
//           currentDebt: Math.round(currentDebt * 100) / 100
//         }
//       }
//     });

//   } catch (error) {
//     logger.error('Error fetching sleep entries:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch sleep entries'
//     });
//   }
// });

// // GET /api/sleep/calendar/:year/:month - Get month view for calendar
// router.get('/calendar/:year/:month', async (req, res) => {
//   try {
//     const { year, month } = req.params;
//     const userId = req.user.id;

//     // Validate year and month
//     const yearNum = parseInt(year);
//     const monthNum = parseInt(month);
    
//     if (yearNum < 2000 || yearNum > 2100 || monthNum < 1 || monthNum > 12) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid year or month'
//       });
//     }

//     // Get start and end of month
//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     const endDate = new Date(yearNum, monthNum, 0);

//     const entries = await SleepEntry.find({
//       userId,
//       date: {
//         $gte: startDate,
//         $lte: endDate
//       }
//     }).sort({ date: 1 });

//     // Format entries for calendar display
//     const calendarData = {};
//     entries.forEach(entry => {
//       const dateKey = entry.formattedDate;
//       calendarData[dateKey] = {
//         sleepDuration: entry.sleepDuration,
//         sleepQuality: entry.sleepQuality,
//         sleepDebt: entry.sleepDebt,
//         bedtime: entry.bedtime,
//         wakeTime: entry.wakeTime,
//         notes: entry.notes,
//         sleepEfficiency: entry.sleepEfficiency
//       };
//     });

//     res.json({
//       success: true,
//       data: {
//         year: yearNum,
//         month: monthNum,
//         entries: calendarData,
//         summary: {
//           daysWithData: entries.length,
//           daysInMonth: endDate.getDate(),
//           completionRate: Math.round((entries.length / endDate.getDate()) * 100)
//         }
//       }
//     });

//   } catch (error) {
//     logger.error('Error fetching calendar data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch calendar data'
//     });
//   }
// });

// // PUT /api/sleep/entries/:id - Update a sleep entry
// router.put('/entries/:id', validateSleepEntry, async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       });
//     }

//     const { id } = req.params;
//     const { bedtime, wakeTime, sleepQuality, notes, targetSleep } = req.body;
//     const userId = req.user.id;

//     // Find the entry
//     const sleepEntry = await SleepEntry.findOne({ _id: id, userId });
//     if (!sleepEntry) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sleep entry not found'
//       });
//     }

//     // Calculate new sleep duration
//     const sleepDuration = calculateSleepDuration(bedtime, wakeTime);
    
//     if (sleepDuration <= 0 || sleepDuration > 24) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid sleep duration calculated'
//       });
//     }

//     // Update the entry
//     sleepEntry.bedtime = new Date(bedtime);
//     sleepEntry.wakeTime = new Date(wakeTime);
//     sleepEntry.sleepDuration = sleepDuration;
//     sleepEntry.sleepQuality = sleepQuality || sleepEntry.sleepQuality;
//     sleepEntry.notes = notes !== undefined ? notes : sleepEntry.notes;
//     sleepEntry.targetSleep = targetSleep || sleepEntry.targetSleep;

//     await sleepEntry.save();

//     // Recalculate cumulative debt for all user entries
//     await SleepEntry.updateCumulativeDebt(userId);

//     logger.info('Sleep entry updated', { 
//       userId, 
//       entryId: id,
//       duration: sleepDuration,
//       debt: sleepEntry.sleepDebt
//     });

//     res.json({
//       success: true,
//       data: sleepEntry,
//       message: 'Sleep entry updated successfully'
//     });

//   } catch (error) {
//     logger.error('Error updating sleep entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update sleep entry'
//     });
//   }
// });

// // DELETE /api/sleep/entries/:id - Delete a sleep entry
// router.delete('/entries/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const sleepEntry = await SleepEntry.findOneAndDelete({ _id: id, userId });
//     if (!sleepEntry) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sleep entry not found'
//       });
//     }

//     // Recalculate cumulative debt for remaining entries
//     await SleepEntry.updateCumulativeDebt(userId);

//     logger.info('Sleep entry deleted', { userId, entryId: id });

//     res.json({
//       success: true,
//       message: 'Sleep entry deleted successfully'
//     });

//   } catch (error) {
//     logger.error('Error deleting sleep entry:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete sleep entry'
//     });
//   }
// });

// // GET /api/sleep/debt/current - Get current sleep debt status
// router.get('/debt/current', async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get most recent sleep entry for current debt
//     const latestEntry = await SleepEntry.findOne({ userId })
//       .sort({ date: -1 });

//     if (!latestEntry) {
//       return res.json({
//         success: true,
//         data: {
//           currentDebt: 0,
//           lastNightSleep: 0,
//           message: 'No sleep data found. Start tracking your sleep!'
//         }
//       });
//     }

//     // Get last 7 days for weekly analysis
//     const weekAgo = new Date();
//     weekAgo.setDate(weekAgo.getDate() - 7);
    
//     const weeklyEntries = await SleepEntry.find({
//       userId,
//       date: { $gte: weekAgo }
//     }).sort({ date: -1 });

//     const weeklyDebt = weeklyEntries.reduce((sum, entry) => sum + entry.sleepDebt, 0);
//     const averageWeeklySleep = weeklyEntries.length > 0 
//       ? weeklyEntries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / weeklyEntries.length 
//       : 0;

//     // Calculate recovery time estimation
//     const recoveryDays = Math.ceil(latestEntry.cumulativeDebt / 2); // Assuming 2h recovery per day

//     res.json({
//       success: true,
//       data: {
//         currentDebt: Math.round(latestEntry.cumulativeDebt * 100) / 100,
//         dailyDebt: Math.round(latestEntry.sleepDebt * 100) / 100,
//         weeklyDebt: Math.round(weeklyDebt * 100) / 100,
//         lastNightSleep: latestEntry.sleepDuration,
//         lastNightQuality: latestEntry.sleepQuality,
//         averageWeeklySleep: Math.round(averageWeeklySleep * 100) / 100,
//         recoveryDays,
//         lastUpdated: latestEntry.date,
//         trend: weeklyEntries.length >= 3 ? calculateDebtTrend(weeklyEntries) : 'insufficient_data'
//       }
//     });

//   } catch (error) {
//     logger.error('Error fetching current sleep debt:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch sleep debt status'
//     });
//   }
// });

// // GET /api/sleep/debt/trend - Get sleep debt trend analysis
// router.get('/debt/trend', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { days = 30 } = req.query;

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - parseInt(days));

//     const entries = await SleepEntry.find({
//       userId,
//       date: { $gte: startDate }
//     }).sort({ date: 1 });

//     if (entries.length === 0) {
//       return res.json({
//         success: true,
//         data: {
//           trend: [],
//           analysis: 'No data available for trend analysis'
//         }
//       });
//     }

//     // Prepare trend data for charting
//     const trendData = entries.map(entry => ({
//       date: entry.formattedDate,
//       sleepDebt: entry.sleepDebt,
//       cumulativeDebt: entry.cumulativeDebt,
//       sleepDuration: entry.sleepDuration,
//       sleepQuality: entry.sleepQuality,
//       targetSleep: entry.targetSleep
//     }));

//     // Calculate trend direction
//     const firstWeek = entries.slice(0, 7);
//     const lastWeek = entries.slice(-7);
    
//     const firstWeekAvgDebt = firstWeek.reduce((sum, entry) => sum + entry.sleepDebt, 0) / firstWeek.length;
//     const lastWeekAvgDebt = lastWeek.reduce((sum, entry) => sum + entry.sleepDebt, 0) / lastWeek.length;
    
//     const trendDirection = lastWeekAvgDebt > firstWeekAvgDebt ? 'worsening' : 'improving';
//     const trendStrength = Math.abs(lastWeekAvgDebt - firstWeekAvgDebt);

//     res.json({
//       success: true,
//       data: {
//         trend: trendData,
//         analysis: {
//           direction: trendDirection,
//           strength: trendStrength,
//           totalDays: entries.length,
//           averageDebt: entries.reduce((sum, entry) => sum + entry.sleepDebt, 0) / entries.length,
//           maxDebt: Math.max(...entries.map(entry => entry.sleepDebt)),
//           minDebt: Math.min(...entries.map(entry => entry.sleepDebt))
//         }
//       }
//     });

//   } catch (error) {
//     logger.error('Error fetching sleep debt trend:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch sleep debt trend'
//     });
//   }
// });

// // GET /api/sleep/productivity/:date - Get productivity curve for specific date
// router.get('/productivity/:date', async (req, res) => {
//   try {
//     const { date } = req.params;
//     const userId = req.user.id;

//     // Validate date
//     const targetDate = new Date(date);
//     if (isNaN(targetDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format'
//       });
//     }

//     // Get sleep entry for the date (or most recent)
//     let sleepEntry = await SleepEntry.findOne({
//       userId,
//       date: {
//         $gte: new Date(targetDate).setHours(0, 0, 0, 0),
//         $lt: new Date(targetDate).setHours(23, 59, 59, 999)
//       }
//     });

//     // If no entry for specific date, get the most recent one
//     if (!sleepEntry) {
//       sleepEntry = await SleepEntry.findOne({ userId })
//         .sort({ date: -1 });
//     }

//     if (!sleepEntry) {
//       return res.json({
//         success: true,
//         data: {
//           productivity: [],
//           message: 'No sleep data available for productivity calculation'
//         }
//       });
//     }

//     // Generate 24-hour productivity curve
//     const productivityCurve = generateProductivityCurve(sleepEntry, targetDate);

//     res.json({
//       success: true,
//       data: {
//         productivity: productivityCurve,
//         sleepData: {
//           sleepDuration: sleepEntry.sleepDuration,
//           sleepQuality: sleepEntry.sleepQuality,
//           sleepDebt: sleepEntry.sleepDebt,
//           cumulativeDebt: sleepEntry.cumulativeDebt
//         },
//         date: targetDate.toISOString().split('T')[0]
//       }
//     });

//   } catch (error) {
//     logger.error('Error calculating productivity curve:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to calculate productivity curve'
//     });
//   }
// });

// // GET /api/sleep/analytics/weekly - Weekly sleep analysis
// router.get('/analytics/weekly', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { weekOffset = 0 } = req.query;

//     // Calculate week start (Monday)
//     const now = new Date();
//     const startOfWeek = new Date(now);
//     startOfWeek.setDate(now.getDate() - now.getDay() + 1 - (parseInt(weekOffset) * 7));
//     startOfWeek.setHours(0, 0, 0, 0);
    
//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 6);
//     endOfWeek.setHours(23, 59, 59, 999);

//     // Generate weekly summary
//     const summary = await SleepDebtSummary.generateSummary(
//       userId, 
//       'weekly', 
//       startOfWeek, 
//       endOfWeek
//     );

//     res.json({
//       success: true,
//       data: summary || {
//         message: 'No sleep data available for this week',
//         weekStart: startOfWeek,
//         weekEnd: endOfWeek
//       }
//     });

//   } catch (error) {
//     logger.error('Error generating weekly analytics:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate weekly analytics'
//     });
//   }
// });

// // GET /api/sleep/analytics/monthly - Monthly sleep analysis
// router.get('/analytics/monthly', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { year, month } = req.query;

//     const targetYear = parseInt(year) || new Date().getFullYear();
//     const targetMonth = parseInt(month) || new Date().getMonth() + 1;

//     const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
//     const endOfMonth = new Date(targetYear, targetMonth, 0);

//     // Generate monthly summary
//     const summary = await SleepDebtSummary.generateSummary(
//       userId,
//       'monthly',
//       startOfMonth,
//       endOfMonth
//     );

//     res.json({
//       success: true,
//       data: summary || {
//         message: 'No sleep data available for this month',
//         month: targetMonth,
//         year: targetYear
//       }
//     });

//   } catch (error) {
//     logger.error('Error generating monthly analytics:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate monthly analytics'
//     });
//   }
// });

// // GET /api/sleep/insights/personal - Get personalized sleep insights
// router.get('/insights/personal', async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get recent entries for analysis
//     const recentEntries = await SleepEntry.find({ userId })
//       .sort({ date: -1 })
//       .limit(30);

//     if (recentEntries.length === 0) {
//       return res.json({
//         success: true,
//         data: {
//           insights: [],
//           recommendations: [],
//           message: 'Start tracking your sleep to receive personalized insights!'
//         }
//       });
//     }

//     // Get or create recent summary for insights
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
//     const summary = await SleepDebtSummary.generateSummary(
//       userId,
//       'monthly',
//       thirtyDaysAgo,
//       new Date()
//     );

//     res.json({
//       success: true,
//       data: {
//         insights: summary?.insights || [],
//         recommendations: summary?.recommendations || [],
//         statistics: summary?.statistics || {},
//         lastUpdated: new Date()
//       }
//     });

//   } catch (error) {
//     logger.error('Error generating personal insights:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate personal insights'
//     });
//   }
// });

// // Helper function to calculate debt trend
// function calculateDebtTrend(entries) {
//   if (entries.length < 3) return 'insufficient_data';
  
//   const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
//   const secondHalf = entries.slice(Math.ceil(entries.length / 2));
  
//   const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.sleepDebt, 0) / firstHalf.length;
//   const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.sleepDebt, 0) / secondHalf.length;
  
//   const diff = secondAvg - firstAvg;
//   return Math.abs(diff) < 0.2 ? 'stable' : (diff > 0 ? 'worsening' : 'improving');
// }

// // Helper function to generate productivity curve
// function generateProductivityCurve(sleepEntry, targetDate) {
//   const curve = [];
//   const baseProductivity = sleepEntry.getProductivityImpact();
  
//   // Simple circadian rhythm model (peaks around 10 AM and 6 PM)
//   for (let hour = 0; hour < 24; hour++) {
//     const time = new Date(targetDate);
//     time.setHours(hour, 0, 0, 0);
    
//     // Basic circadian rhythm (simplified)
//     let circadianFactor = 0.5; // baseline
//     if (hour >= 6 && hour <= 11) {
//       circadianFactor = 0.8 + 0.2 * Math.sin((hour - 6) * Math.PI / 5);
//     } else if (hour >= 14 && hour <= 18) {
//       circadianFactor = 0.7 + 0.3 * Math.sin((hour - 14) * Math.PI / 4);
//     } else if (hour >= 22 || hour <= 5) {
//       circadianFactor = 0.3;
//     }
    
//     const productivity = Math.min(10, Math.max(1, 
//       baseProductivity * circadianFactor * 10
//     ));
    
//     let alertness = 'Low';
//     let recommendation = 'Rest and light activities';
    
//     if (productivity >= 7) {
//       alertness = 'High';
//       recommendation = 'Perfect for demanding tasks';
//     } else if (productivity >= 5) {
//       alertness = 'Medium';
//       recommendation = 'Good for routine work';
//     }
    
//     curve.push({
//       time: time.toISOString(),
//       hour,
//       productivity: Math.round(productivity * 10) / 10,
//       alertness,
//       recommendation
//     });
//   }
  
//   return curve;
// }

// module.exports = router;

// backend/src/routes/sleepTracking.js
const express = require('express');
const router = express.Router();
const SleepEntry = require('../models/SleepEntry');
const SleepDebtSummary = require('../models/SleepDebtSummary');
const { protect } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');
const logger = require('../utils/logger');

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateSleepEntry = [
  body('date').isISO8601().toDate(),
  body('bedtime').isISO8601().toDate(),
  body('wakeTime').isISO8601().toDate(),
  body('sleepQuality').optional().isInt({ min: 1, max: 10 }),
  body('notes').optional().isLength({ max: 500 }),
  body('targetSleep').optional().isFloat({ min: 4, max: 12 }),
];

const validateDateRange = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
];

// Helper function to calculate sleep duration
function calculateSleepDuration(bedtime, wakeTime) {
  const bedtimeMs = new Date(bedtime).getTime();
  let wakeTimeMs = new Date(wakeTime).getTime();
  
  // Handle next-day wake times
  if (wakeTimeMs <= bedtimeMs) {
    wakeTimeMs += 24 * 60 * 60 * 1000; // Add 24 hours
  }
  
  return (wakeTimeMs - bedtimeMs) / (1000 * 60 * 60); // Convert to hours
}

// POST /api/sleep/entries - Create a new sleep entry
router.post('/entries', validateSleepEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { date, bedtime, wakeTime, sleepQuality, notes, targetSleep } = req.body;
    const userId = req.user._id;

    // Calculate sleep duration
    const sleepDuration = calculateSleepDuration(bedtime, wakeTime);
    
    if (sleepDuration <= 0 || sleepDuration > 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sleep duration calculated'
      });
    }

    // Check if entry already exists for this date
    const existingEntry = await SleepEntry.findOne({
      userId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: 'Sleep entry already exists for this date'
      });
    }

    // Get user's default target sleep (you might want to fetch from user profile)
    const defaultTargetSleep = targetSleep || 8;

    // Create new sleep entry
    const sleepEntry = new SleepEntry({
      userId,
      date: new Date(date),
      bedtime: new Date(bedtime),
      wakeTime: new Date(wakeTime),
      sleepDuration,
      sleepQuality: sleepQuality || 7,
      notes: notes || '',
      targetSleep: defaultTargetSleep
    });

    await sleepEntry.save();

    // Update cumulative debt for all user entries
    await SleepEntry.updateCumulativeDebt(userId);

    logger.info('Sleep entry created', { 
      userId, 
      date: sleepEntry.formattedDate,
      duration: sleepDuration,
      debt: sleepEntry.sleepDebt
    });

    res.status(201).json({
      success: true,
      data: sleepEntry,
      message: 'Sleep entry created successfully'
    });

  } catch (error) {
    logger.error('Error creating sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sleep entry'
    });
  }
});

// GET /api/sleep/entries - Get sleep entries with optional date range
router.get('/entries', validateDateRange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { startDate, endDate, limit = 30 } = req.query;

    let query = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await SleepEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate summary statistics
    const totalEntries = entries.length;
    const averageSleep = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / totalEntries 
      : 0;
    const averageQuality = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / totalEntries 
      : 0;
    const currentDebt = totalEntries > 0 ? entries[0].cumulativeDebt : 0;

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalEntries,
          averageSleep: Math.round(averageSleep * 100) / 100,
          averageQuality: Math.round(averageQuality * 100) / 100,
          currentDebt: Math.round(currentDebt * 100) / 100
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching sleep entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep entries'
    });
  }
});

// GET /api/sleep/calendar/:year/:month - Get month view for calendar
router.get('/calendar/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;

    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (yearNum < 2000 || yearNum > 2100 || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month'
      });
    }

    // Get start and end of month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const entries = await SleepEntry.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Format entries for calendar display
    const calendarData = {};
    entries.forEach(entry => {
      const dateKey = entry.formattedDate;
      calendarData[dateKey] = {
        sleepDuration: entry.sleepDuration,
        sleepQuality: entry.sleepQuality,
        sleepDebt: entry.sleepDebt,
        bedtime: entry.bedtime,
        wakeTime: entry.wakeTime,
        notes: entry.notes,
        sleepEfficiency: entry.sleepEfficiency
      };
    });

    res.json({
      success: true,
      data: {
        year: yearNum,
        month: monthNum,
        entries: calendarData,
        summary: {
          daysWithData: entries.length,
          daysInMonth: endDate.getDate(),
          completionRate: Math.round((entries.length / endDate.getDate()) * 100)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data'
    });
  }
});

// PUT /api/sleep/entries/:id - Update a sleep entry
router.put('/entries/:id', validateSleepEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { bedtime, wakeTime, sleepQuality, notes, targetSleep } = req.body;
    const userId = req.user._id;

    // Find the entry
    const sleepEntry = await SleepEntry.findOne({ _id: id, userId });
    if (!sleepEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sleep entry not found'
      });
    }

    // Calculate new sleep duration
    const sleepDuration = calculateSleepDuration(bedtime, wakeTime);
    
    if (sleepDuration <= 0 || sleepDuration > 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sleep duration calculated'
      });
    }

    // Update the entry
    sleepEntry.bedtime = new Date(bedtime);
    sleepEntry.wakeTime = new Date(wakeTime);
    sleepEntry.sleepDuration = sleepDuration;
    sleepEntry.sleepQuality = sleepQuality || sleepEntry.sleepQuality;
    sleepEntry.notes = notes !== undefined ? notes : sleepEntry.notes;
    sleepEntry.targetSleep = targetSleep || sleepEntry.targetSleep;

    await sleepEntry.save();

    // Recalculate cumulative debt for all user entries
    await SleepEntry.updateCumulativeDebt(userId);

    logger.info('Sleep entry updated', { 
      userId, 
      entryId: id,
      duration: sleepDuration,
      debt: sleepEntry.sleepDebt
    });

    res.json({
      success: true,
      data: sleepEntry,
      message: 'Sleep entry updated successfully'
    });

  } catch (error) {
    logger.error('Error updating sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sleep entry'
    });
  }
});

// DELETE /api/sleep/entries/:id - Delete a sleep entry
router.delete('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sleepEntry = await SleepEntry.findOneAndDelete({ _id: id, userId });
    if (!sleepEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sleep entry not found'
      });
    }

    // Recalculate cumulative debt for remaining entries
    await SleepEntry.updateCumulativeDebt(userId);

    logger.info('Sleep entry deleted', { userId, entryId: id });

    res.json({
      success: true,
      message: 'Sleep entry deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sleep entry'
    });
  }
});

// GET /api/sleep/debt/current - Get current sleep debt status
router.get('/debt/current', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get most recent sleep entry for current debt
    const latestEntry = await SleepEntry.findOne({ userId })
      .sort({ date: -1 });

    if (!latestEntry) {
      return res.json({
        success: true,
        data: {
          currentDebt: 0,
          lastNightSleep: 0,
          message: 'No sleep data found. Start tracking your sleep!'
        }
      });
    }

    // Get last 7 days for weekly analysis
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEntries = await SleepEntry.find({
      userId,
      date: { $gte: weekAgo }
    }).sort({ date: -1 });

    const weeklyDebt = weeklyEntries.reduce((sum, entry) => sum + entry.sleepDebt, 0);
    const averageWeeklySleep = weeklyEntries.length > 0 
      ? weeklyEntries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / weeklyEntries.length 
      : 0;

    // Calculate recovery time estimation
    const recoveryDays = Math.ceil(latestEntry.cumulativeDebt / 2); // Assuming 2h recovery per day

    res.json({
      success: true,
      data: {
        currentDebt: Math.round(latestEntry.cumulativeDebt * 100) / 100,
        dailyDebt: Math.round(latestEntry.sleepDebt * 100) / 100,
        weeklyDebt: Math.round(weeklyDebt * 100) / 100,
        lastNightSleep: latestEntry.sleepDuration,
        lastNightQuality: latestEntry.sleepQuality,
        averageWeeklySleep: Math.round(averageWeeklySleep * 100) / 100,
        recoveryDays,
        lastUpdated: latestEntry.date,
        trend: weeklyEntries.length >= 3 ? calculateDebtTrend(weeklyEntries) : 'insufficient_data'
      }
    });

  } catch (error) {
    logger.error('Error fetching current sleep debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep debt status'
    });
  }
});

// GET /api/sleep/debt/trend - Get sleep debt trend analysis
router.get('/debt/trend', async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await SleepEntry.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          trend: [],
          analysis: 'No data available for trend analysis'
        }
      });
    }

    // Prepare trend data for charting
    const trendData = entries.map(entry => ({
      date: entry.formattedDate,
      sleepDebt: entry.sleepDebt,
      cumulativeDebt: entry.cumulativeDebt,
      sleepDuration: entry.sleepDuration,
      sleepQuality: entry.sleepQuality,
      targetSleep: entry.targetSleep
    }));

    // Calculate trend direction
    const firstWeek = entries.slice(0, 7);
    const lastWeek = entries.slice(-7);
    
    const firstWeekAvgDebt = firstWeek.reduce((sum, entry) => sum + entry.sleepDebt, 0) / firstWeek.length;
    const lastWeekAvgDebt = lastWeek.reduce((sum, entry) => sum + entry.sleepDebt, 0) / lastWeek.length;
    
    const trendDirection = lastWeekAvgDebt > firstWeekAvgDebt ? 'worsening' : 'improving';
    const trendStrength = Math.abs(lastWeekAvgDebt - firstWeekAvgDebt);

    res.json({
      success: true,
      data: {
        trend: trendData,
        analysis: {
          direction: trendDirection,
          strength: trendStrength,
          totalDays: entries.length,
          averageDebt: entries.reduce((sum, entry) => sum + entry.sleepDebt, 0) / entries.length,
          maxDebt: Math.max(...entries.map(entry => entry.sleepDebt)),
          minDebt: Math.min(...entries.map(entry => entry.sleepDebt))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching sleep debt trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep debt trend'
    });
  }
});

// GET /api/sleep/productivity/:date - Get productivity curve for specific date
router.get('/productivity/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    // Validate date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Get sleep entry for the date (or most recent)
    let sleepEntry = await SleepEntry.findOne({
      userId,
      date: {
        $gte: new Date(targetDate).setHours(0, 0, 0, 0),
        $lt: new Date(targetDate).setHours(23, 59, 59, 999)
      }
    });

    // If no entry for specific date, get the most recent one
    if (!sleepEntry) {
      sleepEntry = await SleepEntry.findOne({ userId })
        .sort({ date: -1 });
    }

    if (!sleepEntry) {
      return res.json({
        success: true,
        data: {
          productivity: [],
          message: 'No sleep data available for productivity calculation'
        }
      });
    }

    // Generate 24-hour productivity curve
    const productivityCurve = generateProductivityCurve(sleepEntry, targetDate);

    res.json({
      success: true,
      data: {
        productivity: productivityCurve,
        sleepData: {
          sleepDuration: sleepEntry.sleepDuration,
          sleepQuality: sleepEntry.sleepQuality,
          sleepDebt: sleepEntry.sleepDebt,
          cumulativeDebt: sleepEntry.cumulativeDebt
        },
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    logger.error('Error calculating productivity curve:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate productivity curve'
    });
  }
});

// GET /api/sleep/analytics/weekly - Weekly sleep analysis
router.get('/analytics/weekly', async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekOffset = 0 } = req.query;

    // Calculate week start (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 - (parseInt(weekOffset) * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Generate weekly summary
    const summary = await SleepDebtSummary.generateSummary(
      userId, 
      'weekly', 
      startOfWeek, 
      endOfWeek
    );

    res.json({
      success: true,
      data: summary || {
        message: 'No sleep data available for this week',
        weekStart: startOfWeek,
        weekEnd: endOfWeek
      }
    });

  } catch (error) {
    logger.error('Error generating weekly analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly analytics'
    });
  }
});

// GET /api/sleep/analytics/monthly - Monthly sleep analysis
router.get('/analytics/monthly', async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0);

    // Generate monthly summary
    const summary = await SleepDebtSummary.generateSummary(
      userId,
      'monthly',
      startOfMonth,
      endOfMonth
    );

    res.json({
      success: true,
      data: summary || {
        message: 'No sleep data available for this month',
        month: targetMonth,
        year: targetYear
      }
    });

  } catch (error) {
    logger.error('Error generating monthly analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly analytics'
    });
  }
});

// GET /api/sleep/insights/personal - Get personalized sleep insights
router.get('/insights/personal', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent entries for analysis
    const recentEntries = await SleepEntry.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    if (recentEntries.length === 0) {
      return res.json({
        success: true,
        data: {
          insights: [],
          recommendations: [],
          message: 'Start tracking your sleep to receive personalized insights!'
        }
      });
    }

    // Get or create recent summary for insights
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const summary = await SleepDebtSummary.generateSummary(
      userId,
      'monthly',
      thirtyDaysAgo,
      new Date()
    );

    res.json({
      success: true,
      data: {
        insights: summary?.insights || [],
        recommendations: summary?.recommendations || [],
        statistics: summary?.statistics || {},
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    logger.error('Error generating personal insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personal insights'
    });
  }
});

// Helper function to calculate debt trend
function calculateDebtTrend(entries) {
  if (entries.length < 3) return 'insufficient_data';
  
  const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
  const secondHalf = entries.slice(Math.ceil(entries.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.sleepDebt, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.sleepDebt, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  return Math.abs(diff) < 0.2 ? 'stable' : (diff > 0 ? 'worsening' : 'improving');
}

// Helper function to generate productivity curve
function generateProductivityCurve(sleepEntry, targetDate) {
  const curve = [];
  const baseProductivity = sleepEntry.getProductivityImpact();
  
  // Simple circadian rhythm model (peaks around 10 AM and 6 PM)
  for (let hour = 0; hour < 24; hour++) {
    const time = new Date(targetDate);
    time.setHours(hour, 0, 0, 0);
    
    // Basic circadian rhythm (simplified)
    let circadianFactor = 0.5; // baseline
    if (hour >= 6 && hour <= 11) {
      circadianFactor = 0.8 + 0.2 * Math.sin((hour - 6) * Math.PI / 5);
    } else if (hour >= 14 && hour <= 18) {
      circadianFactor = 0.7 + 0.3 * Math.sin((hour - 14) * Math.PI / 4);
    } else if (hour >= 22 || hour <= 5) {
      circadianFactor = 0.3;
    }
    
    const productivity = Math.min(10, Math.max(1, 
      baseProductivity * circadianFactor * 10
    ));
    
    let alertness = 'Low';
    let recommendation = 'Rest and light activities';
    
    if (productivity >= 7) {
      alertness = 'High';
      recommendation = 'Perfect for demanding tasks';
    } else if (productivity >= 5) {
      alertness = 'Medium';
      recommendation = 'Good for routine work';
    }
    
    curve.push({
      time: time.toISOString(),
      hour,
      productivity: Math.round(productivity * 10) / 10,
      alertness,
      recommendation
    });
  }
  
  return curve;
}

module.exports = router;