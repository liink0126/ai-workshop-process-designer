import React, { useState, useMemo } from 'react';
import { ProcessOption } from '../types';
import { SparklesIcon, CheckIcon, XMarkIcon, ArrowRightIcon, ClockIcon } from './Icon';

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
    if (selectedIds.size < minSelect) {
      alert(`최소 ${minSelect}개 이상 선택해주세요.`);
      return;
    }

    const selected = options.filter(opt => selectedIds.has(opt.id));
    if (selected.length === 0) {
      alert('선택된 옵션이 없습니다.');
      return;
    }
    
    onSelect(selected);
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'summary' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options.map((option, index) => {
                const isSelected = selectedIds.has(option.id);
                const totalDuration = option.plan.reduce((sum, step) => sum + step.duration, 0);

                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggle(option.id)}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg'
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
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-indigo-600">옵션 {index + 1}</span>
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

                  {/* 시간축 타임라인 비교 - 열로 구분 */}
                  <div className="overflow-x-auto">
                    <div className="flex gap-4" style={{ minWidth: `${comparisonData.mappedOptions.length * 400}px` }}>
                      {/* 시간 축 (왼쪽 고정) */}
                      <div className="flex-shrink-0 w-24 sticky left-0 bg-white z-10">
                        <div className="h-full border-r-2 border-gray-300 pr-2">
                          <div className="text-xs font-semibold text-gray-600 mb-2">시간</div>
                          <div className="relative" style={{ height: `${(comparisonData.maxTime / 10) * 20}px` }}>
                            {Array.from({ length: Math.ceil(comparisonData.maxTime / 30) + 1 }).map((_, i) => {
                              const time = i * 30;
                              if (time > comparisonData.maxTime) return null;
                              const position = (time / comparisonData.maxTime) * 100;
                              return (
                                <div
                                  key={i}
                                  className="absolute flex items-center gap-2"
                                  style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
                                >
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                    {formatTime(time)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 각 옵션별 컬럼 */}
                      {comparisonData.mappedOptions.map((mapped, optionIdx) => (
                        <div
                          key={mapped.option.id}
                          className="flex-1 min-w-[350px] border-2 border-gray-200 rounded-lg p-4 bg-white"
                        >
                          {/* 옵션 헤더 */}
                          <div className="mb-4 pb-3 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-lg text-indigo-600">
                                옵션 {mapped.optionIndex}
                              </span>
                              {selectedIds.has(mapped.option.id) && (
                                <CheckIcon className="w-5 h-5 text-indigo-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{mapped.option.summary}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <ClockIcon />
                              <span>총 {formatTime(mapped.totalTime)}</span>
                            </div>
                          </div>

                          {/* 단계들을 시간축에 배치 */}
                          <div
                            className="relative border-l-2 border-gray-300 pl-2"
                            style={{ height: `${(comparisonData.maxTime / 10) * 20}px` }}
                          >
                            {mapped.steps.map((step, stepIdx) => {
                              const colors = typeColors[step.type] || typeColors['본론'];
                              const topPercent = (step.startTime / comparisonData.maxTime) * 100;
                              const heightPercent = (step.duration / comparisonData.maxTime) * 100;

                              return (
                                <div
                                  key={stepIdx}
                                  className={`absolute ${colors.bg} ${colors.border} border-2 rounded-lg p-2 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                                  style={{
                                    top: `${topPercent}%`,
                                    height: `${Math.max(heightPercent, 5)}%`,
                                    width: 'calc(100% - 8px)',
                                    minHeight: '50px',
                                    left: '4px',
                                  }}
                                  title={step.title}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-semibold ${colors.text}`}>
                                      {step.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(step.duration)}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-800 line-clamp-2 flex-1">
                                    {step.title}
                                  </p>
                                  <div className="text-[10px] text-gray-500 mt-1">
                                    {formatTime(step.startTime)} - {formatTime(step.endTime)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
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
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            선택된 옵션: <span className="font-bold text-indigo-600">{selectedIds.size}</span> / {maxSelect}
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
      </div>
    </div>
  );
};

export default ProcessOptionsSelector;
