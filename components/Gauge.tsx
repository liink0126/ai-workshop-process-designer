import React from 'react';

interface GaugeProps {
  value: number; // 0 to 100
}

const Gauge: React.FC<GaugeProps> = ({ value }) => {
  const clampedValue = Math.max(0, Math.min(value, 100));
  const angle = (clampedValue / 100) * 180; // 0 to 180 degrees
  
  const getLevel = (val: number) => {
      if (val < 25) return { label: '초급', color: '#3b82f6' }; // blue-500
      if (val < 50) return { label: '중급', color: '#16a34a' }; // green-600
      if (val < 75) return { label: '고급', color: '#f59e0b' }; // amber-500
      return { label: '전문가', color: '#dc2626' }; // red-600
  };

  const level = getLevel(clampedValue);

  return (
    <div className="relative w-48 h-32 overflow-visible">
      <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
        {/* Background Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke="#e5e7eb" // gray-200
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke={level.color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="125.66" // Circumference of semi-circle: PI * radius
          strokeDashoffset={125.66 - (clampedValue / 100) * 125.66}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
        <span className="text-2xl font-bold text-gray-800">{clampedValue}</span>
        <span className="text-sm text-gray-500"> / 100</span>
        <div className="text-xs font-semibold mt-1" style={{ color: level.color }}>
          {level.label}
        </div>
      </div>
    </div>
  );
};

export default Gauge;