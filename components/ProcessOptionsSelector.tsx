import React, { useState } from 'react';
import { ProcessOption } from '../types';
import { SparklesIcon, CheckIcon, XMarkIcon, ArrowRightIcon } from './Icon';

interface ProcessOptionsSelectorProps {
  options: ProcessOption[];
  onSelect: (selectedOptions: ProcessOption[]) => void;
  onCancel: () => void;
  minSelect?: number;
  maxSelect?: number;
}

const ProcessOptionsSelector: React.FC<ProcessOptionsSelectorProps> = ({
  options,
  onSelect,
  onCancel,
  minSelect = 1,
  maxSelect = 3
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <SparklesIcon />
              프로세스 옵션 선택
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              원하는 옵션을 선택하세요 ({minSelect}-{maxSelect}개 선택 가능)
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
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
                    <p className="text-lg font-bold text-gray-800">{Math.floor(totalDuration / 60)}시간 {totalDuration % 60}분</p>
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

