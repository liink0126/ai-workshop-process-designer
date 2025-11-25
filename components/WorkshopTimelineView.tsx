import React from 'react';
import { WorkshopStep } from '../types';

interface WorkshopTimelineViewProps {
  plan: WorkshopStep[];
}

const typeColors: { [key: string]: string } = {
  '오프닝': 'bg-teal-100 border-teal-300',
  '본론': 'bg-purple-100 border-purple-300',
  '클로징': 'bg-rose-100 border-rose-300',
  '휴식': 'bg-slate-100 border-slate-300',
};

const WorkshopTimelineView: React.FC<WorkshopTimelineViewProps> = ({ plan }) => {
  const totalDuration = plan.reduce((sum, step) => sum + step.duration, 0);

  let accumulatedTime = 0;
  const timeMarkers = [];
  const hours = Math.ceil(totalDuration / 60);

  for (let i = 1; i <= hours; i++) {
    timeMarkers.push({
      time: i * 60,
      label: `${i}시간`
    });
  }

  return (
    <div className="mt-6">
      <div className="relative w-full h-24 flex items-end border-b-2 border-slate-300 pb-2">
        {plan.map((step, index) => {
          const widthPercentage = (step.duration / totalDuration) * 100;
          accumulatedTime += step.duration;
          return (
            <div
              key={step.id}
              className={`h-16 p-2 rounded-lg border-2 ${typeColors[step.type] || 'bg-gray-100 border-gray-300'} flex flex-col justify-between overflow-hidden transition-all duration-300 hover:h-20 hover:shadow-lg`}
              style={{ width: `${widthPercentage}%` }}
              title={`${step.title} (${step.duration}분)`}
            >
              <p className="text-xs font-bold text-slate-800 truncate">{step.title}</p>
              <p className="text-xs text-slate-500 self-end font-mono">{step.duration}분</p>
            </div>
          );
        })}
        {/* Time Markers */}
        {timeMarkers.map(marker => (
           <div 
             key={marker.time}
             className="absolute -bottom-5 text-center text-xs text-slate-400"
             style={{ left: `${(marker.time / totalDuration) * 100}%` }}
            >
              <div className="w-px h-2 bg-slate-300 mx-auto"></div>
              {marker.label}
            </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>시작</span>
        <span>종료</span>
      </div>
    </div>
  );
};

export default WorkshopTimelineView;
