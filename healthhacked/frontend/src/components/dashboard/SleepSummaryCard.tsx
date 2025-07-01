import React, { useState, useEffect } from 'react';
import { Moon, Calendar, TrendingUp, TrendingDown, Clock, AlertTriangle, Target, Activity } from 'lucide-react';
import { healthAPI } from '../../services/api';
// Sleep Intelligence Summary Card for Dashboard
const DashboardSleepSummary = () => {
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSleepSummary();
  }, []);

  const fetchSleepSummary = async () => {
  try {
    const response = await healthAPI.getCurrentSleepDebt();
    if (response.success && response.data.currentDebt > 0) {
      // Transform API data to component format
      const apiData = response.data;
      const sleepData = {
        currentDebt: apiData.currentDebt,
        lastNightSleep: apiData.lastNightSleep,
        lastNightQuality: apiData.lastNightQuality,
        weeklyAverage: apiData.averageWeeklySleep,
        trend: apiData.trend,
        nextRecommendation: 'Go to bed 30 minutes earlier tonight',
        productivityToday: 7.2, // Could fetch from productivity endpoint
        peakHours: ['10:00 AM', '3:00 PM']
      };
      setSleepData(sleepData);
    } else {
      setSleepData(null); // Show "no data" state
    }
    setLoading(false);
  } catch (error) {
    console.error('Error fetching sleep summary:', error);
    setSleepData(null);
    setLoading(false);
  }
};

  const getDebtStatus = (debt) => {
    if (debt <= 1) return { color: 'text-green-400', bg: 'bg-green-500/20', status: 'Excellent' };
    if (debt <= 3) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', status: 'Good' };
    if (debt <= 5) return { color: 'text-orange-400', bg: 'bg-orange-500/20', status: 'Needs Attention' };
    return { color: 'text-red-400', bg: 'bg-red-500/20', status: 'Critical' };
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sleepData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Moon className="h-5 w-5 text-purple-400" />
            Sleep Intelligence
          </h3>
          <a 
            href="/sleep/dashboard"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            Start Tracking →
          </a>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <Moon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sleep data yet</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Start tracking your sleep to get personalized insights and productivity forecasts
          </p>
          <a 
            href="/sleep/calendar"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Add Sleep Entry
          </a>
        </div>
      </div>
    );
  }

  const debtStatus = getDebtStatus(sleepData.currentDebt);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Moon className="h-5 w-5 text-purple-400" />
          Sleep Intelligence
        </h3>
        <a 
          href="/sleep/dashboard"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          View Details →
        </a>
      </div>

      {/* Sleep Debt Status */}
      <div className={`${debtStatus.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Sleep Debt</span>
          <span className={`text-xs font-medium ${debtStatus.color}`}>
            {debtStatus.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${debtStatus.color}`}>
            {sleepData.currentDebt.toFixed(1)}h
          </span>
          <div className="flex items-center gap-1 text-sm">
            {sleepData.trend === 'improving' ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={sleepData.trend === 'improving' ? 'text-green-400' : 'text-red-400'}>
              {sleepData.trend}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Last Night</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {sleepData.lastNightSleep.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400">
            Quality: {sleepData.lastNightQuality}/10
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">Weekly Avg</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {sleepData.weeklyAverage.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400">
            Target: 8.0h
          </div>
        </div>
      </div>

      {/* Today's Productivity Forecast */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Today's Forecast</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">
            {sleepData.productivityToday.toFixed(1)}/10
          </span>
          <span className="text-xs text-purple-300">
            Peak: {sleepData.peakHours.join(', ')}
          </span>
        </div>
        
        {/* Mini Productivity Bar */}
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
            style={{ width: `${(sleepData.productivityToday / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gray-700/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-yellow-400 mb-1">
              Today's Recommendation
            </div>
            <div className="text-sm text-gray-300">
              {sleepData.nextRecommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4">
        <a 
          href="/sleep/calendar"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          Add Entry
        </a>
        <a 
          href="/sleep/dashboard"
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          View Insights
        </a>
      </div>
    </div>
  );
};

export { DashboardSleepSummary };
export default DashboardSleepSummary;