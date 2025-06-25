import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Clock, Star } from 'lucide-react';
import { Card } from '../ui/Card';

interface SleepInsightsProps {
  insights: {
    profile: {
      chronotype: string;
      targetSleepHours: number;
    };
    sleepDebt: {
      totalDebt: number;
      averageDebt: number;
      entriesCount: number;
    };
    averages: {
      sleepDuration: number;
      sleepQuality: number;
      sleepinessScore: number;
      consistency: number;
    };
    trends?: {
      sleepDuration: number;
      sleepQuality: number;
      direction: 'improving' | 'declining';
    } | null;
    entriesCount: number;
  };
}

export const SleepInsights: React.FC<SleepInsightsProps> = ({ insights }) => {
  const {
    profile,
    sleepDebt,
    averages,
    trends,
    entriesCount
  } = insights;

  const getTrendIcon = (value: number) => {
    if (value > 0.1) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (value < -0.1) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getQualityRating = (score: number) => {
    if (score >= 8) return { text: 'Excellent', color: 'text-green-400' };
    if (score >= 6) return { text: 'Good', color: 'text-blue-400' };
    if (score >= 4) return { text: 'Fair', color: 'text-yellow-400' };
    return { text: 'Poor', color: 'text-red-400' };
  };

  const getConsistencyRating = (score: number) => {
    if (score >= 80) return { text: 'Very Consistent', color: 'text-green-400' };
    if (score >= 60) return { text: 'Moderately Consistent', color: 'text-blue-400' };
    if (score >= 40) return { text: 'Somewhat Inconsistent', color: 'text-yellow-400' };
    return { text: 'Very Inconsistent', color: 'text-red-400' };
  };

  const sleepQualityRating = getQualityRating(averages.sleepQuality);
  const consistencyRating = getConsistencyRating(averages.consistency);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Sleep Insights</h3>
        <div className="flex items-center text-sm text-gray-400">
          <Star className="h-4 w-4 mr-1" />
          Based on {entriesCount} nights
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Sleep Duration */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Avg Sleep Duration</span>
            {trends && getTrendIcon(trends.sleepDuration)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {averages.sleepDuration.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">
            Target: {profile.targetSleepHours}h
            {averages.sleepDuration < profile.targetSleepHours && (
              <span className="text-yellow-400 ml-1">
                (-{(profile.targetSleepHours - averages.sleepDuration).toFixed(1)}h)
              </span>
            )}
          </div>
        </motion.div>

        {/* Sleep Quality */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Sleep Quality</span>
            {trends && getTrendIcon(trends.sleepQuality)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {averages.sleepQuality.toFixed(1)}/10
          </div>
          <div className={`text-xs ${sleepQualityRating.color}`}>
            {sleepQualityRating.text}
          </div>
        </motion.div>

        {/* Sleep Debt */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Sleep Debt</span>
            <Target className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {sleepDebt.totalDebt.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">
            Avg: {sleepDebt.averageDebt.toFixed(1)}h/night
          </div>
        </motion.div>

        {/* Consistency */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Schedule Consistency</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {averages.consistency}%
          </div>
          <div className={`text-xs ${consistencyRating.color}`}>
            {consistencyRating.text}
          </div>
        </motion.div>

        {/* Chronotype */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Chronotype</span>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1 capitalize">
            {profile.chronotype}
          </div>
          <div className="text-xs text-gray-500">
            {profile.chronotype === 'morning' && 'Early Bird'}
            {profile.chronotype === 'evening' && 'Night Owl'}
            {profile.chronotype === 'intermediate' && 'Flexible'}
          </div>
        </motion.div>

        {/* Stanford Sleepiness */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Avg Sleepiness</span>
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {averages.sleepinessScore.toFixed(1)}/7
          </div>
          <div className="text-xs text-gray-500">
            Stanford Scale
          </div>
        </motion.div>
      </div>

      {/* Trends Summary */}
      {trends && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-sm font-medium text-white mb-2">Recent Trends</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              {getTrendIcon(trends.sleepDuration)}
              <span className="ml-1 text-gray-300">
                Sleep duration {trends.sleepDuration > 0 ? 'increased' : 'decreased'} by{' '}
                {Math.abs(trends.sleepDuration).toFixed(1)}h
              </span>
            </div>
            <div className="flex items-center">
              {getTrendIcon(trends.sleepQuality)}
              <span className="ml-1 text-gray-300">
                Quality {trends.sleepQuality > 0 ? 'improved' : 'declined'} by{' '}
                {Math.abs(trends.sleepQuality).toFixed(1)} points
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm font-medium ${
              trends.direction === 'improving' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              Overall trend: {trends.direction === 'improving' ? '📈 Improving' : '📉 Needs attention'}
            </span>
          </div>
        </motion.div>
      )}
    </Card>
  );
};