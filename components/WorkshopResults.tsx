import React, { useRef, useMemo, memo } from 'react';
import { WorkshopStep, WorkshopAnalysis, WorkshopPreparation } from '../types';
import WorkshopStepCard from './WorkshopStepCard';
import DifficultyAnalysis from './DifficultyAnalysis';
import WorkshopTimelineView from './WorkshopTimelineView';
import WorkshopPreparationSection from './WorkshopPreparation';
import { BeakerIcon, PrinterIcon, ListBulletIcon, Bars3Icon } from './Icon';
import { formatDuration } from '../utils/format';

interface WorkshopResultsProps {
  workshopPlan: WorkshopStep[];
  analysis: WorkshopAnalysis;
  preparation?: WorkshopPreparation | null;
  isSaved: boolean;
  viewMode: 'list' | 'timeline';
  suggestingStepId: string | null;
  onUpdateStep: (updatedStep: WorkshopStep) => void;
  onSuggestAlternative: (stepId: string) => void;
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  onSort: (dragItem: number, dragOverItem: number) => void;
  onConsult: () => void;
}

const WorkshopResults: React.FC<WorkshopResultsProps> = memo(({
  workshopPlan,
  analysis,
  preparation,
  isSaved,
  viewMode,
  suggestingStepId,
  onUpdateStep,
  onSuggestAlternative,
  onViewModeChange,
  onSort,
  onConsult,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const totalDuration = useMemo(() => {
    return workshopPlan.reduce((sum, step) => sum + step.duration, 0);
  }, [workshopPlan]);


  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    onSort(dragItem.current, dragOverItem.current);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div ref={resultsRef} className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 mt-6 sm:mt-8 animate-fade-in printable-area overflow-visible">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <BeakerIcon />
            <span>맞춤 워크숍 계획</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 no-print">
            AI 제안을 수정하거나, 좌측 핸들을 드래그하여 순서를 변경해 보세요.
          </p>
          {isSaved && (
            <p className="text-xs sm:text-sm text-green-600 font-semibold mt-2 no-print">
              이 워크숍 설계안이 'My History'에 저장되었습니다.
            </p>
          )}
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
          <div className="text-center sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500">총 소요 시간</p>
            <p className="font-bold text-lg sm:text-xl text-indigo-600">{formatDuration(totalDuration)}</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors no-print px-3 py-1.5 sm:px-0 sm:py-0"
          >
            <PrinterIcon /> 
            <span className="hidden sm:inline">PDF로 내보내기</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      <DifficultyAnalysis 
        analysis={analysis}
        onConsult={onConsult}
      />
      
      <div className="flex justify-end items-center my-4 no-print">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => onViewModeChange('list')} 
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ListBulletIcon />
          </button>
          <button 
            onClick={() => onViewModeChange('timeline')} 
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              viewMode === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bars3Icon />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4 mt-6">
          {workshopPlan.map((step, index) => (
            <div
              key={step.id}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="workshop-step-card"
            >
              <WorkshopStepCard 
                step={step} 
                onUpdate={onUpdateStep} 
                isSuggesting={suggestingStepId === step.id}
                onSuggestAlternative={onSuggestAlternative}
              />
            </div>
          ))}
        </div>
      ) : (
        <WorkshopTimelineView plan={workshopPlan} />
      )}

      {preparation && (
        <WorkshopPreparationSection preparation={preparation} />
      )}
    </div>
  );
});

WorkshopResults.displayName = 'WorkshopResults';

export default WorkshopResults;

