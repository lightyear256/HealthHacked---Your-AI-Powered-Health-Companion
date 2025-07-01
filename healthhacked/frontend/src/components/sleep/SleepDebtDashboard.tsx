import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Brain, Target, Calendar } from 'lucide-react';
import { healthAPI } from '../../services/api';

const SleepDebtDashboard = () => {
  const [debtData, setDebtData] = useState(null);
  const [productivityCurve, setProductivityCurve] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
  const fetchSleepData = async () => {
    try {
      setLoading(true);
      
      // Fetch current debt status
      const debtResponse = await healthAPI.getCurrentSleepDebt();
      if (debtResponse.success) {
        setDebtData(debtResponse.data);
      }
      
      // Fetch productivity curve for today
      const today = new Date().toISOString().split('T')[0];
      const productivityResponse = await healthAPI.getProductivityCurve(today);
      if (productivityResponse.success) {
        setProductivityCurve(productivityResponse.data.productivity);
      }
      
      // Fetch 30-day trend
      const trendResponse = await healthAPI.getSleepTrend(30);
      if (trendResponse.success) {
        setTrendData(trendResponse.data.trend);
      }
      
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      // Fall back to mock data if API fails
      const mockData = {
        currentDebt: 0,
        lastNightSleep: 0,
        message: 'Start tracking your sleep to see insights!'
      };
      setDebtData(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  fetchSleepData();
}, []);

  const getDebtColor = (debt) => {
    if (debt <= 1) return 'text-green-400';
    if (debt <= 3) return 'text-yellow-400';
    if (debt <= 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDebtBgColor = (debt) => {
    if (debt <= 1) return 'from-green-500/20 to-green-600/20';
    if (debt <= 3) return 'from-yellow-500/20 to-yellow-600/20';
    if (debt <= 5) return 'from-orange-500/20 to-orange-600/20';
    return 'from-red-500/20 to-red-600/20';
  };

  const getRecoveryTime = (debt) => {
    if (debt <= 1) return '1 day';
    if (debt <= 3) return '2-3 days';
    if (debt <= 5) return '1 week';
    return '2+ weeks';
  };

  const getDebtStatus = (debt) => {
    if (debt <= 1) return 'Excellent';
    if (debt <= 3) return 'Manageable';
    if (debt <= 5) return 'Concerning';
    return 'Critical';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-16">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            Sleep Intelligence Dashboard
          </h1>
          <p className="text-gray-400">
            Track your sleep debt and optimize your daily productivity
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Sleep Debt */}
          <div className={`bg-gradient-to-br ${getDebtBgColor(debtData.currentDebt)} bg-gray-800 rounded-xl p-6 border border-gray-700`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Current Sleep Debt</h3>
              <Moon className={`h-6 w-6 ${getDebtColor(debtData.currentDebt)}`} />
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <CircularProgress 
                value={debtData.currentDebt}
                max={10}
                color={getDebtColor(debtData.currentDebt)}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getDebtColor(debtData.currentDebt)}`}>
                  {debtData.currentDebt.toFixed(1)}h
                </span>
                <span className="text-xs text-gray-400">debt</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className={`font-medium ${getDebtColor(debtData.currentDebt)}`}>
                  {getDebtStatus(debtData.currentDebt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Recovery Time:</span>
                <span className="text-white">{getRecoveryTime(debtData.currentDebt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weekly Total:</span>
                <span className="text-white">{debtData.weeklyDebt.toFixed(1)}h</span>
              </div>
            </div>
          </div>

          {/* Last Night Summary */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Last Night</h3>
              <Sun className="h-6 w-6 text-yellow-400" />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {debtData.lastNightSleep.toFixed(1)}h
                </div>
                <div className="text-gray-400 text-sm">Sleep Duration</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Quality</span>
                    <span className="text-white">{debtData.lastNightQuality}/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        debtData.lastNightQuality >= 8 ? 'bg-green-500' :
                        debtData.lastNightQuality >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(debtData.lastNightQuality / 10) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Daily Debt</span>
                    <span className={getDebtColor(debtData.dailyDebt)}>
                      +{debtData.dailyDebt.toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Weekly Average</h3>
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {debtData.averageWeeklySleep.toFixed(1)}h
                </div>
                <div className="text-gray-400 text-sm">Per Night</div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                {debtData.trend === 'improving' ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : debtData.trend === 'worsening' ? (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  debtData.trend === 'improving' ? 'text-green-400' :
                  debtData.trend === 'worsening' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {debtData.trend.charAt(0).toUpperCase() + debtData.trend.slice(1)}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400">
                  Target: 8.0h per night
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  debtData.averageWeeklySleep >= 8 ? 'text-green-400' :
                  debtData.averageWeeklySleep >= 7 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {debtData.averageWeeklySleep >= 8 ? 'On Track' :
                   debtData.averageWeeklySleep >= 7 ? 'Close' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Curve */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Today's Productivity Forecast</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <ProductivityChart 
            data={productivityCurve}
            sleepDebt={debtData.currentDebt}
          />
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Peak Hours</span>
              </div>
              <div className="text-gray-300">
                10 AM - 12 PM, 3 PM - 5 PM
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Moderate Hours</span>
              </div>
              <div className="text-gray-300">
                8 AM - 10 AM, 1 PM - 3 PM
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Low Energy</span>
              </div>
              <div className="text-gray-300">
                12 PM - 1 PM, 6 PM onwards
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Debt Trend */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Sleep Debt Trend (30 Days)</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Last 30 days</span>
            </div>
          </div>
          
          <SleepTrendChart data={trendData} />
          
          {/* Recommendations */}
          <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <Target className="h-5 w-5" />
              <span className="font-semibold">Recommendations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm text-gray-300">
                • Go to bed 30 minutes earlier tonight
              </div>
              <div className="text-sm text-gray-300">
                • Avoid caffeine after 2 PM
              </div>
              <div className="text-sm text-gray-300">
                • Create a consistent wind-down routine
              </div>
              <div className="text-sm text-gray-300">
                • Schedule important tasks during peak hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Circular Progress Component
const CircularProgress = ({ value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="rgba(75, 85, 99, 0.3)"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className={color}
        style={{
          transition: 'stroke-dashoffset 1s ease-in-out'
        }}
      />
    </svg>
  );
};

// Productivity Chart Component
const ProductivityChart = ({ data, sleepDebt }) => {
  const maxProductivity = Math.max(...data.map(d => d.productivity));
  const currentHour = new Date().getHours();

  return (
    <div className="relative h-64 bg-gray-900 rounded-lg p-4">
      <svg className="w-full h-full" viewBox="0 0 800 200">
        {/* Grid lines */}
        {[0, 2, 4, 6, 8, 10].map(value => (
          <g key={value}>
            <line 
              x1="40" 
              y1={180 - (value / 10) * 160} 
              x2="760" 
              y2={180 - (value / 10) * 160}
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="1"
            />
            <text 
              x="20" 
              y={185 - (value / 10) * 160}
              fill="rgba(156, 163, 175, 0.8)"
              fontSize="12"
              textAnchor="middle"
            >
              {value}
            </text>
          </g>
        ))}
        
        {/* Productivity curve */}
        <path
          d={`M ${data.map((d, i) => `${50 + (i * 30)},${180 - (d.productivity / 10) * 160}`).join(' L ')}`}
          stroke="#8B5CF6"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Gradient fill */}
        <defs>
          <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path
          d={`M ${data.map((d, i) => `${50 + (i * 30)},${180 - (d.productivity / 10) * 160}`).join(' L ')} L 760,180 L 50,180 Z`}
          fill="url(#productivityGradient)"
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={50 + (i * 30)}
            cy={180 - (d.productivity / 10) * 160}
            r={d.hour === currentHour ? "6" : "4"}
            fill={d.hour === currentHour ? "#F59E0B" : "#8B5CF6"}
            stroke={d.hour === currentHour ? "#FCD34D" : "#A78BFA"}
            strokeWidth="2"
          />
        ))}
        
        {/* Time labels */}
        {data.filter((_, i) => i % 4 === 0).map((d, i) => (
          <text
            key={i}
            x={50 + (i * 4 * 30)}
            y={195}
            fill="rgba(156, 163, 175, 0.8)"
            fontSize="12"
            textAnchor="middle"
          >
            {d.hour.toString().padStart(2, '0')}:00
          </text>
        ))}
      </svg>
      
      {/* Current time indicator */}
      <div 
        className="absolute top-4 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium"
        style={{ 
          left: `${((currentHour / 24) * 100)}%`,
          transform: 'translateX(-50%)'
        }}
      >
        Now
      </div>
      
      {/* Sleep debt impact indicator */}
      <div className="absolute top-4 right-4 bg-gray-700 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <span className="text-gray-300">
            Debt Impact: <span className="text-orange-400">{Math.round(sleepDebt * 10)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Sleep Trend Chart Component
const SleepTrendChart = ({ data }) => {
  const maxDebt = Math.max(...data.map(d => d.debt));
  
  return (
    <div className="h-48 bg-gray-900 rounded-lg p-4">
      <svg className="w-full h-full" viewBox="0 0 800 160">
        {/* Grid */}
        {[0, 1, 2, 3, 4, 5].map(value => (
          <line 
            key={value}
            x1="0" 
            y1={140 - (value / 5) * 120} 
            x2="800" 
            y2={140 - (value / 5) * 120}
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="1"
          />
        ))}
        
        {/* Debt trend line */}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 800},${140 - (d.debt / Math.max(maxDebt, 5)) * 120}`).join(' L ')}`}
          stroke="#EF4444"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Sleep duration line */}
        <path
          d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 800},${140 - (d.sleep / 10) * 120}`).join(' L ')}`}
          stroke="#10B981"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={(i / (data.length - 1)) * 800}
              cy={140 - (d.debt / Math.max(maxDebt, 5)) * 120}
              r="3"
              fill="#EF4444"
            />
            <circle
              cx={(i / (data.length - 1)) * 800}
              cy={140 - (d.sleep / 10) * 120}
              r="3"
              fill="#10B981"
            />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Sleep Debt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Sleep Duration</span>
        </div>
      </div>
    </div>
  );
};

// Mock data generators
const generateMockProductivityCurve = (sleepDebt) => {
  const baseImpact = Math.min(sleepDebt * 0.1, 0.5);
  const curve = [];
  
  for (let hour = 0; hour < 24; hour++) {
    let circadianFactor = 0.5;
    
    // Morning peak
    if (hour >= 8 && hour <= 12) {
      circadianFactor = 0.7 + 0.3 * Math.sin((hour - 8) * Math.PI / 4);
    }
    // Afternoon peak
    else if (hour >= 14 && hour <= 18) {
      circadianFactor = 0.6 + 0.4 * Math.sin((hour - 14) * Math.PI / 4);
    }
    // Night/early morning
    else if (hour >= 22 || hour <= 6) {
      circadianFactor = 0.2;
    }
    // Afternoon dip
    else if (hour >= 12 && hour <= 14) {
      circadianFactor = 0.4;
    }
    
    const productivity = Math.max(1, Math.min(10, 
      (1 - baseImpact) * circadianFactor * 10
    ));
    
    curve.push({
      hour,
      productivity: Math.round(productivity * 10) / 10
    });
  }
  
  return curve;
};

const generateMockTrendData = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      day: i + 1,
      debt: Math.random() * 4 + 0.5,
      sleep: Math.random() * 2 + 6.5
    });
  }
  return data;
};

export default SleepDebtDashboard;