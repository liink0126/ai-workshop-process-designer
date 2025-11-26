import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WorkshopStep } from '../types';
import {
  ClockIcon,
  TagIcon,
  GripVerticalIcon,
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ArrowsRightLeftIcon,
} from './Icon';
import TechniqueDetailPopover from './TechniqueDetailPopover';

interface WorkshopStepCardProps {
  step: WorkshopStep;
  onUpdate: (updatedStep: WorkshopStep) => void;
  isSuggesting?: boolean;
  onSuggestAlternative?: (stepId: string) => void;
}

const typeColors: { [key: string]: { border: string; text: string; accent: string; tagBg: string; } } = {
  '오프닝': { border: 'border-teal-400', text: 'text-teal-700', accent: 'bg-teal-400', tagBg: 'bg-teal-50' },
  '본론': { border: 'border-purple-400', text: 'text-purple-700', accent: 'bg-purple-400', tagBg: 'bg-purple-50' },
  '클로징': { border: 'border-rose-400', text: 'text-rose-700', accent: 'bg-rose-400', tagBg: 'bg-rose-50' },
  '휴식': { border: 'border-gray-400', text: 'text-gray-700', accent: 'bg-gray-400', tagBg: 'bg-gray-100' },
  'default': { border: 'border-gray-500', text: 'text-gray-700', accent: 'bg-gray-500', tagBg: 'bg-gray-100' },
};


const WorkshopStepCard: React.FC<WorkshopStepCardProps> = ({ step, onUpdate, isSuggesting = false, onSuggestAlternative }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStep, setEditedStep] = useState(step);
  const [showRationale, setShowRationale] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  
  const colors = typeColors[step.type] || typeColors.default;

  useEffect(() => {
    setEditedStep(step);
  }, [step]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { activities, questions } = useMemo(() => {
    const parts = step.description.split('#### 퍼실리테이터의 핵심 질문');
    const activitiesPart = parts[0]?.replace('#### 주요 활동', '').trim() || '';
    const questionsPart = parts[1]?.trim() || '';
    return {
      activities: (window as any).marked?.parse(activitiesPart) || '',
      questions: (window as any).marked?.parse(questionsPart) || '',
    };
  }, [step.description]);


  const handleSave = () => {
    onUpdate(editedStep);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStep(step);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Omit<WorkshopStep, 'id' | 'type'>, value: string | number) => {
    setEditedStep(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTechniqueClick = (technique: string) => {
    setActivePopover(activePopover === technique ? null : technique);
  };
  
  const techniqueTags = useMemo(
    () => step.techniques.split(',').map(t => t.trim()).filter(Boolean),
    [step.techniques]
  );

  if (isEditing) {
    return (
      <div className={`p-4 rounded-xl border-2 ${colors.border} shadow-lg flex gap-4 bg-white`}>
        <div className="flex-grow space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500">단계</label>
            <input
              type="text"
              value={editedStep.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-1 border-b-2 bg-transparent border-gray-300 focus:border-indigo-500 outline-none text-lg font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">설명 (Markdown 지원)</label>
            <textarea
              value={editedStep.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={8}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-gray-50/50"
              placeholder="#### 주요 활동&#10;...&#10;&#10;#### 퍼실리테이터의 핵심 질문&#10;..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500">소요 시간 (분)</label>
              <input
                type="number"
                value={editedStep.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value, 10) || 0)}
                className="w-full p-1 bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500">주요 기법</label>
              <input
                type="text"
                value={editedStep.techniques}
                onChange={(e) => handleChange('techniques', e.target.value)}
                className="w-full p-1 bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-5">
          <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
            <CheckIcon />
          </button>
          <button onClick={handleCancel} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
            <XMarkIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group rounded-xl shadow-sm border border-gray-200/90 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 flex items-stretch bg-white relative`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colors.accent} rounded-l-xl`}></div>
      <div className="cursor-grab text-gray-400 hover:text-indigo-600 p-4 flex items-center justify-center bg-gray-50/70 border-r border-gray-200/80 no-print ml-1.5">
        <GripVerticalIcon />
      </div>
      <div className="flex-grow p-4">
        <div className="flex justify-between items-start gap-4">
            <div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.tagBg} ${colors.text}`}>{step.type}</span>
                <h4 className="font-bold text-lg text-gray-800 mt-2">{step.title}</h4>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
                <div className={`flex items-center gap-1.5 text-lg font-bold ${colors.text}`}>
                    <ClockIcon />
                    <span>{step.duration}분</span>
                </div>
                <div className="flex items-center no-print mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     {onSuggestAlternative && (
                        <button
                            onClick={() => onSuggestAlternative(step.id)}
                            disabled={isSuggesting}
                            className="text-gray-400 hover:text-indigo-600 p-2 -mr-2 rounded-md transition-colors disabled:text-gray-300 disabled:cursor-wait"
                            aria-label="다른 제안 보기"
                            title="AI에게 이 단계에 대한 다른 활동 제안받기"
                        >
                            {isSuggesting ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <ArrowsRightLeftIcon />
                            )}
                        </button>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-indigo-600 p-2 -mr-2 rounded-md transition-colors"
                      aria-label="수정"
                    >
                      <PencilSquareIcon />
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-4 space-y-4 text-gray-700">
            {activities && (
              <div>
                  <h5 className="font-semibold text-gray-500 flex items-center gap-2 mb-2">
                      <ClipboardDocumentListIcon/>
                      주요 활동
                  </h5>
                  <div className="prose prose-base max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: activities }} />
              </div>
            )}
            {questions && (
                <div>
                    <h5 className="font-semibold text-gray-500 flex items-center gap-2 mb-2">
                        <QuestionMarkCircleIcon/>
                        퍼실리테이터의 핵심 질문
                    </h5>
                    <div className="prose prose-base max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: questions }} />
                </div>
            )}
        </div>
       
        <div className="flex items-start gap-2 border-t border-gray-200/80 mt-4 pt-3">
          <div className="flex-shrink-0 mt-1">
            <TagIcon className="text-gray-400 h-5 w-5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {techniqueTags.map(tag => (
              <div key={tag} className="relative">
                <button
                  onClick={() => handleTechniqueClick(tag)}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  {tag}
                </button>
                {activePopover === tag && (
                  <div ref={popoverRef} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20">
                    <TechniqueDetailPopover techniqueName={tag} onClose={() => setActivePopover(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {step.techniquesRationale && (
            <button 
                onClick={() => setShowRationale(!showRationale)} 
                className="ml-auto text-gray-400 hover:text-indigo-600"
                title="AI의 기법 추천 이유 보기"
            >
                <QuestionMarkCircleIcon />
            </button>
          )}
        </div>
         {showRationale && step.techniquesRationale && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-200 animate-fade-in">
                <p><span className="font-bold text-indigo-900">AI's Rationale:</span> {step.techniquesRationale}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopStepCard;