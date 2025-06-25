
import React from 'react';
import { motion } from 'framer-motion';

interface ProductivityWaveProps {
  curve: Array<{
    hour: number;
    productivity: number;
    zone: string;
  }>;
  recommendations: Array<{
    type: string;
    timeSlot: { start: number; end: number };
    description: string;
    priority: number;
  }>;
}

export const ProductivityWave: React.FC<ProductivityWaveProps> = ({ curve, recommendations }) => {
  const currentHour = new Date().getHours();
  
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'peak': return '#10B981'; // green
      case 'high': return '#3B82F6'; // blue
      case 'moderate': return '#F59E0B'; // yellow
      case 'low': return '#EF4444'; // red
      case 'critical': return '#7C2D12'; // dark red
      default: return '#6B7280'; // gray
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'deep_work': return '#8B5CF6'; // purple
      case 'creative': return '#06B6D4'; // cyan
      case 'routine': return '#84CC16'; // lime
      case 'rest': return '#F97316'; // orange
      default: return '#6B7280'; // gray
    }
  };

  return (
    <div className="relative h-64 w-full">
      {/* Grid lines */}
      <div className="absolute inset-0 grid grid-cols-24 opacity-20">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="border-r border-gray-600" />
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>

      {/* Productivity curve */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Area under curve */}
        <path
          d={`M 0,${256} ${curve.map((point, index) => 
            `L ${(index / 23) * 100}%,${256 - (point.productivity * 256)}`
          ).join(' ')} L 100%,${256} Z`}
          fill="url(#productivityGradient)"
        />
        
        {/* Main curve line */}
        <motion.path
          d={`M ${curve.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${(index / 23) * 100}%,${256 - (point.productivity * 256)}`
          ).join(' ')}`}
          stroke="#8B5CF6"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Current time indicator */}
        <motion.line
          x1={`${(currentHour / 23) * 100}%`}
          y1="0"
          x2={`${(currentHour / 23) * 100}%`}
          y2="100%"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />

        {/* Data points */}
        {curve.map((point, index) => (
          <motion.circle
            key={index}
            cx={`${(index / 23) * 100}%`}
            cy={256 - (point.productivity * 256)}
            r="4"
            fill={getZoneColor(point.zone)}
            stroke="#FFFFFF"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + (index * 0.02) }}
          />
        ))}
      </svg>

      {/* Hour labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 -mb-6">
        {Array.from({ length: 25 }, (_, i) => i).filter(i => i % 4 === 0).map(hour => (
          <span key={hour}>{hour}:00</span>
        ))}
      </div>

      {/* Recommendation overlays */}
      <div className="absolute inset-0">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            className="absolute top-0 opacity-40 rounded-sm"
            style={{
              left: `${(rec.timeSlot.start / 23) * 100}%`,
              width: `${((rec.timeSlot.end - rec.timeSlot.start) / 23) * 100}%`,
              height: '100%',
              backgroundColor: getRecommendationColor(rec.type)
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 2 + (index * 0.2) }}
            title={rec.description}
          />
        ))}
      </div>
    </div>
  );
};
