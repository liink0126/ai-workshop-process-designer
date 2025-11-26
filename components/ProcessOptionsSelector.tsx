import React, { useState, useMemo } from 'react';
import { ProcessOption } from '../types';
import { SparklesIcon, CheckIcon, XMarkIcon, ArrowRightIcon, ClockIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon } from './Icon';

interface ProcessOptionsSelectorProps {
  options: ProcessOption[];
  onSelect: (selectedOptions: ProcessOption[]) => void;
  onCancel: () => void;
  minSelect?: number;
  maxSelect?: number;
}

type ViewMode = 'summary' | 'compare';

const ProcessOptionsSelector: React.FC<ProcessOptionsSelectorProps> = ({
  options,
  onSelect,
  onCancel,
  minSelect = 1,
  maxSelect = 3
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(options.map(opt => opt.id)));
  const [viewMode, setViewMode] = useState<ViewMode>('summary');

  const handleToggle = (optionId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        if (newSet.size >= maxSelect) {
          alert(`최대 ${maxSelect}개까지 선택할 수 있습니다.`);
          return prev;
        }
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      alert('최소 1개 이상 선택해주세요.');
      return;
    }

    const selected = options.filter(opt => selectedIds.has(opt.id));
    if (selected.length === 0) {
      alert('선택된 옵션이 없습니다.');
      return;
    }
    
    // 첫 번째 선택된 옵션만 사용하여 최종 프로세스 구성
    onSelect([selected[0]]);
  };

  // 시간축 기반 비교 데이터 생성
  const comparisonData = useMemo(() => {
    const selectedOptions = options.filter(opt => selectedIds.has(opt.id));
    if (selectedOptions.length === 0) return null;

    // 모든 옵션의 최대 시간 계산
    const maxTime = Math.max(
      ...selectedOptions.map(opt => 
        opt.plan.reduce((sum, step) => sum + step.duration, 0)
      )
    );

    // 시간 간격 (10분 단위)
    const timeInterval = 10;
    const timeSlots: number[] = [];
    for (let i = 0; i <= maxTime; i += timeInterval) {
      timeSlots.push(i);
    }

    // 각 옵션의 단계를 시간 슬롯에 매핑
    const mappedOptions = selectedOptions.map((option, optionIndex) => {
      let currentTime = 0;
      const steps = option.plan.map(step => {
        const startTime = currentTime;
        const endTime = currentTime + step.duration;
        currentTime = endTime;
        return {
          ...step,
          startTime,
          endTime,
        };
      });
      return {
        option,
        optionIndex: optionIndex + 1,
        steps,
        totalTime: currentTime,
      };
    });

    return {
      timeSlots,
      mappedOptions,
      maxTime,
    };
  }, [options, selectedIds]);

  const typeColors: Record<string, { bg: string; border: string; text: string }> = {
    '오프닝': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    '본론': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    '휴식': { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
    '클로징': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <SparklesIcon />
              프로세스 옵션 선택
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              원하는 옵션을 선택하세요 ({minSelect}-{maxSelect}개 선택 가능)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                요약
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'compare'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                프로세스 비교
              </button>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {viewMode === 'summary' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options.map((option, index) => {
                const isSelected = selectedIds.has(option.id);
                const isPrimary = isSelected && selectedIds.size > 0 && 
                  options.findIndex(opt => selectedIds.has(opt.id)) === options.findIndex(opt => opt.id === option.id);
                const totalDuration = option.plan.reduce((sum, step) => sum + step.duration, 0);

                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggle(option.id)}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      isPrimary
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-2 ring-indigo-200'
                        : isSelected
                        ? 'border-indigo-400 bg-indigo-50/70 shadow-md'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {/* 선택 체크박스 */}
                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckIcon className="text-white w-5 h-5" />}
                    </div>

                    {/* 옵션 번호 */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-2xl font-bold text-indigo-600">옵션 {index + 1}</span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                          최종 선택
                        </span>
                      )}
                      {isSelected && !isPrimary && (
                        <span className="px-2 py-0.5 bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-full">
                          선택됨
                        </span>
                      )}
                    </div>

                    {/* 요약 */}
                    <p className="text-sm text-gray-700 mb-4 font-medium">{option.summary}</p>

                    {/* 총 시간 */}
                    <div className="mb-4 p-2 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600">총 소요 시간</p>
                      <p className="text-lg font-bold text-gray-800">{formatTime(totalDuration)}</p>
                    </div>

                    {/* 장점 */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-green-700 mb-2">✓ 장점</p>
                      <ul className="space-y-1">
                        {option.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 단점 */}
                    <div>
                      <p className="text-xs font-semibold text-orange-700 mb-2">⚠ 단점</p>
                      <ul className="space-y-1">
                        {option.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                            <span className="text-orange-600 mt-0.5">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 난이도 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">난이도</span>
                        <span className={`font-semibold ${
                          option.analysis.difficulty === '쉬움' ? 'text-green-600' :
                          option.analysis.difficulty === '보통' ? 'text-yellow-600' :
                          option.analysis.difficulty === '어려움' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {option.analysis.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // 프로세스 비교 뷰
            <div className="space-y-4">
              {comparisonData && comparisonData.mappedOptions.length > 0 ? (
                <>
                  {/* 비교 안내 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>프로세스 비교 모드:</strong> 선택한 옵션들의 워크숍 단계를 시간축에 따라 비교할 수 있습니다. 
                      각 단계는 색상으로 구분되며, 시간에 따라 배치되어 있습니다.
                    </p>
                  </div>

                  {/* 3개 열로 구분된 프로세스 비교 - 시간 기반 정렬 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {comparisonData.mappedOptions.map((mapped) => {
                      const isSelected = selectedIds.has(mapped.option.id);
                      const isPrimary = isSelected && selectedIds.size > 0 && 
                        options.findIndex(opt => selectedIds.has(opt.id)) === options.findIndex(opt => opt.id === mapped.option.id);
                      
                      return (
                        <div
                          key={mapped.option.id}
                          onClick={() => handleToggle(mapped.option.id)}
                          className={`flex flex-col border-2 rounded-lg bg-white overflow-visible cursor-pointer transition-all duration-200 ${
                            isPrimary 
                              ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' 
                              : isSelected 
                              ? 'border-indigo-300 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* 옵션 헤더 - 선택 상태 표시 */}
                          <div className={`sticky top-0 z-10 p-4 pb-3 border-b-0 rounded-t-lg ${
                            isPrimary ? 'bg-indigo-50' : isSelected ? 'bg-indigo-50/50' : 'bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-lg ${
                                  isPrimary ? 'text-indigo-700' : isSelected ? 'text-indigo-600' : 'text-indigo-600'
                                }`}>
                                  옵션 {mapped.optionIndex}
                                </span>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                    최종 선택
                                  </span>
                                )}
                                {isSelected && !isPrimary && (
                                  <span className="px-2 py-0.5 bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-full">
                                    선택됨
                                  </span>
                                )}
                              </div>
                              {isSelected ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <CheckIcon className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{mapped.option.summary}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ClockIcon />
                              <span>총 {formatTime(mapped.totalTime)}</span>
                            </div>
                          </div>

                        {/* 단계들을 시간에 비례한 높이로 배치 */}
                        <div className="relative p-4" style={{ minHeight: `${(comparisonData.maxTime / 10) * 8}px` }}>
                          {mapped.steps.map((step, stepIdx) => {
                            const colors = typeColors[step.type] || typeColors['본론'];
                            const topPercent = (step.startTime / comparisonData.maxTime) * 100;
                            const heightPercent = (step.duration / comparisonData.maxTime) * 100;
                            
                            return (
                              <div
                                key={stepIdx}
                                className={`absolute ${colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-sm w-[calc(100%-2rem)]`}
                                style={{
                                  top: `${topPercent}%`,
                                  height: `${heightPercent}%`,
                                  minHeight: '200px',
                                }}
                              >
                                {/* 단계 헤더 */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.text} ${colors.bg}`}>
                                      {step.type}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {formatTime(step.startTime)} - {formatTime(step.endTime)}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {formatTime(step.duration)}
                                  </span>
                                </div>

                                {/* 제목 */}
                                <h4 className="font-bold text-base text-gray-800 mb-3">
                                  {step.title}
                                </h4>

                                {/* 설명 (전체 내용) - 스크롤 가능 */}
                                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
                                  {step.description && (() => {
                                    const parts = step.description.split('#### 퍼실리테이터의 핵심 질문');
                                    const activitiesPart = parts[0]?.replace('#### 주요 활동', '').trim() || '';
                                    const questionsPart = parts[1]?.trim() || '';
                                    
                                    // Markdown 파싱 (marked 라이브러리 사용)
                                    const parseMarkdown = (text: string) => {
                                      if (typeof window !== 'undefined' && (window as any).marked) {
                                        return (window as any).marked.parse(text);
                                      }
                                      return text;
                                    };
                                    
                                    return (
                                      <div className="text-sm text-gray-700">
                                        {activitiesPart && (
                                          <div className="mb-3">
                                            <h5 className="font-semibold text-gray-600 mb-2 flex items-center gap-2 text-sm">
                                              <ClipboardDocumentListIcon className="w-4 h-4" />
                                              주요 활동
                                            </h5>
                                            <div 
                                              className="prose prose-sm max-w-none prose-slate" 
                                              dangerouslySetInnerHTML={{ __html: parseMarkdown(activitiesPart) }}
                                            />
                                          </div>
                                        )}
                                        {questionsPart && (
                                          <div className="mb-3">
                                            <h5 className="font-semibold text-gray-600 mb-2 flex items-center gap-2 text-sm">
                                              <QuestionMarkCircleIcon className="w-4 h-4" />
                                              퍼실리테이터의 핵심 질문
                                            </h5>
                                            <div 
                                              className="prose prose-sm max-w-none prose-slate" 
                                              dangerouslySetInnerHTML={{ __html: parseMarkdown(questionsPart) }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* 기법 */}
                                  {step.techniques && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs text-gray-500 mb-1">사용 기법</p>
                                      <p className="text-sm text-gray-700">{step.techniques}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>비교할 옵션을 선택해주세요.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-600">
                선택된 옵션: <span className="font-bold text-indigo-600">{selectedIds.size}</span> / {maxSelect}
              </div>
              {selectedIds.size > 0 && (
                <div className="text-xs text-gray-500">
                  {(() => {
                    const selected = options.filter(opt => selectedIds.has(opt.id));
                    const primaryOption = selected[0];
                    const primaryIndex = options.findIndex(opt => opt.id === primaryOption.id) + 1;
                    return `최종 선택: 옵션 ${primaryIndex}${selected.length > 1 ? ` (${selected.length}개 중 첫 번째)` : ''}`;
                  })()}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size < minSelect}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                선택 완료
                <ArrowRightIcon />
              </button>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <span className="font-semibold text-gray-700">💡 팁:</span>
              <span>옵션 카드를 클릭하여 선택/해제할 수 있습니다. 여러 개 선택 시 첫 번째 선택된 옵션이 최종 프로세스로 구성됩니다.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessOptionsSelector;
