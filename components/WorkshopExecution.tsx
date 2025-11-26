import React, { useState, useEffect } from 'react';
import { WorkshopExecution as WorkshopExecutionType, WorkshopStep, WorkshopData } from '../types';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon } from './Icon';
import RealTimeSituationHandler from './RealTimeSituationHandler';
import TimeAdjustmentHandler from './TimeAdjustmentHandler';

interface WorkshopExecutionProps {
  execution: WorkshopExecutionType;
  workshopPlan: WorkshopStep[];
  workshopContext: WorkshopData;
  onPlanUpdate?: (updatedPlan: WorkshopStep[]) => void;
}

const WorkshopExecutionSection: React.FC<WorkshopExecutionProps> = ({ 
  execution, 
  workshopPlan, 
  workshopContext,
  onPlanUpdate 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(workshopPlan[0]?.duration || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed(prev => prev + 1);
      }, 1000); // 1초 단위 (테스트용, 실제로는 60000ms = 1분)

      return () => clearInterval(timer);
    }
  }, [isRunning, timeRemaining]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeRemaining(workshopPlan[currentStepIndex]?.duration || 0);
    setTotalElapsed(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < workshopPlan.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setTimeRemaining(workshopPlan[currentStepIndex + 1]?.duration || 0);
      setIsRunning(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimeRemaining(workshopPlan[currentStepIndex - 1]?.duration || 0);
      setIsRunning(false);
    }
  };

  const currentStep = workshopPlan[currentStepIndex];
  const totalDuration = workshopPlan.reduce((sum, step) => sum + step.duration, 0);
  const progress = totalElapsed > 0 ? (totalElapsed / totalDuration) * 100 : 0;
  const completedSteps = workshopPlan.slice(0, currentStepIndex);
  const remainingPlan = workshopPlan.slice(currentStepIndex);

  if (!execution.timerEnabled) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg shadow-green-100/50 mt-6 sm:mt-8 animate-fade-in no-print">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 mb-6">
        <ClockIcon />
        <span>워크숍 실행 타이머</span>
      </h2>

      {/* 시간 조정 핸들러 */}
      <TimeAdjustmentHandler
        completedSteps={completedSteps}
        remainingPlan={remainingPlan}
        workshopContext={workshopContext}
        onPlanReorganized={(newPlan) => {
          if (onPlanUpdate) {
            onPlanUpdate(newPlan);
            // 재구성된 계획에 맞춰 현재 단계 인덱스 조정
            setCurrentStepIndex(completedSteps.length);
            setTimeRemaining(newPlan[completedSteps.length]?.duration || 0);
          }
        }}
      />

      {/* 현재 단계 타이머 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">현재 단계</p>
          <h3 className="text-xl font-bold text-gray-800">{currentStep?.title || '시작 전'}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {currentStepIndex + 1} / {workshopPlan.length}
          </p>
        </div>

        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-indigo-600 mb-2">
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600">남은 시간</p>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <PlayIcon />
              시작
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <PauseIcon />
              일시정지
            </button>
          )}
          <button
            onClick={handleStop}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <StopIcon />
            정지
          </button>
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
          >
            이전 단계
          </button>
          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === workshopPlan.length - 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors"
          >
            다음 단계
          </button>
        </div>
      </div>

      {/* 전체 진행률 */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">전체 진행률</p>
          <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 시간 조정 가이드 */}
      {execution.timeAdjustmentGuide && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
            <h4 className="text-lg font-bold text-gray-800 mb-3">⏰ 시간이 부족할 때</h4>
            <ul className="space-y-2">
              {execution.timeAdjustmentGuide.ifTimeShort.map((strategy, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-600 font-bold mt-0.5">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <h4 className="text-lg font-bold text-gray-800 mb-3">⏱️ 시간이 남을 때</h4>
            <ul className="space-y-2">
              {execution.timeAdjustmentGuide.ifTimeExtra.map((strategy, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 실시간 상황 핸들러 */}
      <RealTimeSituationHandler
        currentPlan={workshopPlan}
        currentStepIndex={currentStepIndex}
        workshopContext={workshopContext}
        onPlanUpdate={onPlanUpdate}
      />
    </div>
  );
};

// 아이콘 컴포넌트들
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </svg>
);

export default WorkshopExecutionSection;

