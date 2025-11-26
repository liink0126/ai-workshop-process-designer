import React, { useState } from 'react';
import { WorkshopStep, WorkshopData } from '../types';
import { ClockIcon, ArrowPathIcon } from './Icon';
import { reorganizeRemainingProcess } from '../services/processOptimizationService';

interface TimeAdjustmentHandlerProps {
  completedSteps: WorkshopStep[];
  remainingPlan: WorkshopStep[];
  workshopContext: WorkshopData;
  onPlanReorganized: (newPlan: WorkshopStep[]) => void;
}

const TimeAdjustmentHandler: React.FC<TimeAdjustmentHandlerProps> = ({
  completedSteps,
  remainingPlan,
  workshopContext,
  onPlanReorganized
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newRemainingTime, setNewRemainingTime] = useState(0);
  const [isReorganizing, setIsReorganizing] = useState(false);

  const currentRemainingTime = remainingPlan.reduce((sum, step) => sum + step.duration, 0);

  const handleReorganize = async () => {
    if (newRemainingTime <= 0) {
      alert('남은 시간을 올바르게 입력해주세요.');
      return;
    }

    setIsReorganizing(true);
    try {
      const newPlan = await reorganizeRemainingProcess(
        completedSteps,
        newRemainingTime,
        [...completedSteps, ...remainingPlan],
        workshopContext
      );

      // ID 추가
      const planWithIds = newPlan.map(step => ({
        ...step,
        id: crypto.randomUUID()
      }));

      onPlanReorganized([...completedSteps, ...planWithIds]);
      setIsOpen(false);
      setNewRemainingTime(0);
      alert('프로세스가 재구성되었습니다!');
    } catch (error) {
      console.error('프로세스 재구성 실패:', error);
      alert('프로세스 재구성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsReorganizing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon />
          <div>
            <p className="text-sm font-semibold text-gray-800">시간 조정</p>
            <p className="text-xs text-gray-600">
              현재 남은 시간: {Math.floor(currentRemainingTime / 60)}시간 {currentRemainingTime % 60}분
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon />
          시간 변경 시 재구성
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            새로운 남은 시간 (분)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={newRemainingTime || ''}
              onChange={(e) => setNewRemainingTime(parseInt(e.target.value, 10) || 0)}
              placeholder="예: 120"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              min="1"
            />
            <button
              onClick={handleReorganize}
              disabled={isReorganizing || newRemainingTime <= 0}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isReorganizing ? '재구성 중...' : '재구성하기'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            남은 시간이 변경되면 AI가 남은 프로세스를 자동으로 재구성합니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeAdjustmentHandler;

