import React from 'react';
import { motion } from 'framer-motion';

interface SleepDebtMeterProps {
  debt: number;
  target: number;
}

export const SleepDebtMeter: React.FC<SleepDebtMeterProps> = ({ debt, target }) => {
  const percentage = Math.min(100, (debt / (target * 2)) * 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getDebtLevel = () => {
    if (debt < 1) return { level: 'Excellent', color: '#10B981', message: 'Well rested!' };
    if (debt < 3) return { level: 'Good', color: '#3B82F6', message: 'Minor deficit' };
    if (debt < 5) return { level: 'Moderate', color: '#F59E0B', message: 'Need more sleep' };
    if (debt < 8) return { level: 'High', color: '#EF4444', message: 'Significant debt' };
    return { level: 'Critical', color: '#7C2D12', message: 'Urgent attention needed' };
  };

  const debtInfo = getDebtLevel();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={debtInfo.color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-2xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {debt.toFixed(1)}h
          </motion.span>
          <span className="text-xs text-gray-400">debt</span>
        </div>
      </div>

      {/* Status */}
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${debtInfo.color}20`, color: debtInfo.color }}
        >
          {debtInfo.level}
        </div>
        <p className="text-xs text-gray-400 mt-2">{debtInfo.message}</p>
      </motion.div>
    </div>
  );
};