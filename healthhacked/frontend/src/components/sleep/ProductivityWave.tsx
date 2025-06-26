import React, { useState, useEffect } from 'react';

interface ProductivityWaveProps {
  curve?: Array<{
    hour: number;
    productivity: number;
    zone: string;
  }>;
  recommendations?: Array<{
    type: string;
    timeSlot: { start: number; end: number };
    description: string;
    priority: number;
  }>;
}

export const ProductivityWave: React.FC<ProductivityWaveProps> = ({ 
  curve = generateSampleData(),
  recommendations = generateSampleRecommendations()
}) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'peak': return '#065f46';
      case 'high': return '#1e3a8a';
      case 'moderate': return '#92400e';
      case 'low': return '#991b1b';
      case 'critical': return '#7f1d1d';
      default: return '#374151';
    }
  };

  const getRecommendationType = (type: string) => {
    switch (type) {
      case 'deep_work': return { color: '#4338ca', name: 'Deep Work' };
      case 'creative': return { color: '#0369a1', name: 'Creative' };
      case 'routine': return { color: '#4d7c0f', name: 'Routine' };
      case 'rest': return { color: '#c2410c', name: 'Rest' };
      default: return { color: '#4b5563', name: 'Other' };
    }
  };

  const currentProductivity = curve[currentHour]?.productivity || 0;

  return (
    <div className="relative h-[500px] w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Productivity Analysis</h2>
            <p className="text-sm text-slate-400">Today's energy and focus patterns</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-100">
              {Math.round(currentProductivity * 100)}%
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Current ({currentHour}:00)
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container with proper margins */}
      <div className="absolute inset-0 top-24 left-12 right-8 bottom-16">
        {/* Y-axis */}
        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 font-medium">
          {['100', '75', '50', '25', '0'].map((label, i) => (
            <span key={label} className="transform -translate-y-1/2">
              {label}
            </span>
          ))}
        </div>

        {/* Chart SVG with full coverage */}
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          
          {/* Grid */}
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
            <line
              key={i}
              x1="0"
              y1={`${(1 - y) * 100}%`}
              x2="100%"
              y2={`${(1 - y) * 100}%`}
              stroke="#334155"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Vertical grid lines */}
          {Array.from({ length: 25 }, (_, i) => i).filter(i => i % 4 === 0).map((hour) => (
            <line
              key={hour}
              x1={`${(hour / 24) * 100}%`}
              y1="0"
              x2={`${(hour / 24) * 100}%`}
              y2="100%"
              stroke="#334155"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Recommendation bars */}
          {recommendations.map((rec, index) => {
            const recType = getRecommendationType(rec.type);
            return (
              <rect
                key={index}
                x={`${(rec.timeSlot.start / 24) * 100}%`}
                y="0"
                width={`${((rec.timeSlot.end - rec.timeSlot.start) / 24) * 100}%`}
                height="100%"
                fill={recType.color}
                opacity="0.12"
              />
            );
          })}
          
          {/* Area under curve */}
          <path
            d={`M 0,100% ${curve.map((point, index) => 
              `L ${(index / 23) * 100},${(1 - point.productivity) * 100}`
            ).join(' ')} L 100,100 Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Main line */}
          <path
            d={`M ${curve.map((point, index) => 
              `${(index / 23) * 100},${(1 - point.productivity) * 100}`
            ).join(' L ')}`}
            stroke="url(#lineGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current time indicator */}
          <line
            x1={`${(currentHour / 24) * 100}%`}
            y1="0"
            x2={`${(currentHour / 24) * 100}%`}
            y2="100%"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.8"
          />

          {/* Data points */}
          {curve.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / 23) * 100}%`}
              cy={`${(1 - point.productivity) * 100}%`}
              r={hoveredPoint === index ? "6" : "4"}
              fill="#0f172a"
              stroke={getZoneColor(point.zone)}
              strokeWidth="2.5"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-8 left-12 right-8 flex justify-between text-xs text-slate-500 font-medium">
        {Array.from({ length: 25 }, (_, i) => i).filter(i => i % 4 === 0).map((hour) => (
          <span
            key={hour}
            className={hour === currentHour ? 'text-amber-500 font-semibold' : ''}
          >
            {hour.toString().padStart(2, '0')}:00
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div
          className="absolute bg-slate-800 text-slate-100 p-3 rounded-lg text-sm shadow-2xl border border-slate-600 z-20"
          style={{
            left: `${12 + (hoveredPoint / 23) * (100 - 20)}%`,
            top: `${120 + (1 - curve[hoveredPoint].productivity) * 280}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{hoveredPoint.toString().padStart(2, '0')}:00</div>
          <div className="text-slate-300">{Math.round(curve[hoveredPoint].productivity * 100)}% productivity</div>
          <div className="text-xs text-slate-400 capitalize mt-1">{curve[hoveredPoint].zone} performance zone</div>
          <div className="absolute w-2 h-2 bg-slate-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs">
        <div className="font-semibold text-slate-100 mb-3">Activity Recommendations</div>
        <div className="space-y-2">
          {recommendations.slice(0, 4).map((rec, i) => {
            const recType = getRecommendationType(rec.type);
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: recType.color }}
                />
                <span className="text-slate-200">{recType.name}</span>
                <span className="text-slate-500 ml-auto">
                  {rec.timeSlot.start}:00-{rec.timeSlot.end}:00
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sample data generators
function generateSampleData() {
  return Array.from({ length: 24 }, (_, hour) => {
    let productivity;
    
    if (hour >= 0 && hour < 6) productivity = 0.15 + Math.random() * 0.15;
    else if (hour >= 6 && hour < 9) productivity = 0.4 + Math.random() * 0.25;
    else if (hour >= 9 && hour < 12) productivity = 0.75 + Math.random() * 0.25;
    else if (hour >= 12 && hour < 14) productivity = 0.45 + Math.random() * 0.2;
    else if (hour >= 14 && hour < 17) productivity = 0.65 + Math.random() * 0.25;
    else if (hour >= 17 && hour < 20) productivity = 0.4 + Math.random() * 0.25;
    else productivity = 0.25 + Math.random() * 0.2;
    
    let zone;
    if (productivity > 0.8) zone = 'peak';
    else if (productivity > 0.6) zone = 'high';
    else if (productivity > 0.4) zone = 'moderate';
    else if (productivity > 0.2) zone = 'low';
    else zone = 'critical';
    
    return { hour, productivity: Math.min(productivity, 1), zone };
  });
}

function generateSampleRecommendations() {
  return [
    {
      type: 'deep_work',
      timeSlot: { start: 9, end: 12 },
      description: 'Focus on complex tasks during peak morning hours',
      priority: 1
    },
    {
      type: 'creative',
      timeSlot: { start: 14, end: 16 },
      description: 'Creative work during afternoon focus window',
      priority: 2
    },
    {
      type: 'routine',
      timeSlot: { start: 16, end: 18 },
      description: 'Handle administrative tasks in moderate energy period',
      priority: 3
    },
    {
      type: 'rest',
      timeSlot: { start: 21, end: 23 },
      description: 'Wind down and prepare for rest',
      priority: 4
    }
  ];
}

export default ProductivityWave;