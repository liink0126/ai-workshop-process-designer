import React, { useState } from 'react';
import { WorkshopFeedback } from '../types';
import { StarIcon, XMarkIcon } from './Icon';

interface WorkshopFeedbackModalProps {
  isOpen: boolean;
  workshopId: string;
  onClose: () => void;
  onSubmit: (feedback: Omit<WorkshopFeedback, 'workshopId' | 'userId' | 'createdAt'>) => void;
}

const WorkshopFeedbackModal: React.FC<WorkshopFeedbackModalProps> = ({
  isOpen,
  workshopId,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(5);
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [suggestions, setSuggestions] = useState('');
  const [executedAsPlanned, setExecutedAsPlanned] = useState(true);
  const [actualDuration, setActualDuration] = useState('');

  if (!isOpen) return null;

  const handleAddStrength = () => {
    setStrengths([...strengths, '']);
  };

  const handleRemoveStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const handleStrengthChange = (index: number, value: string) => {
    const newStrengths = [...strengths];
    newStrengths[index] = value;
    setStrengths(newStrengths);
  };

  const handleAddImprovement = () => {
    setImprovements([...improvements, '']);
  };

  const handleRemoveImprovement = (index: number) => {
    setImprovements(improvements.filter((_, i) => i !== index));
  };

  const handleImprovementChange = (index: number, value: string) => {
    const newImprovements = [...improvements];
    newImprovements[index] = value;
    setImprovements(newImprovements);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating,
      strengths: strengths.filter(s => s.trim()),
      improvements: improvements.filter(i => i.trim()),
      suggestions: suggestions.trim(),
      executedAsPlanned,
      actualDuration: actualDuration ? parseFloat(actualDuration) : undefined
    });
    // 초기화
    setRating(5);
    setStrengths(['']);
    setImprovements(['']);
    setSuggestions('');
    setExecutedAsPlanned(true);
    setActualDuration('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">워크숍 피드백</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 평점 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              전체 만족도
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-lg transition-colors ${
                    star <= rating
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StarIcon />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{rating}점 / 5점</p>
          </div>

          {/* 강점 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              강점 (잘 작동한 부분)
            </label>
            {strengths.map((strength, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => handleStrengthChange(index, e.target.value)}
                  placeholder="예: 시간 관리가 잘 되었음"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {strengths.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStrength(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStrength}
              className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
            >
              + 강점 추가
            </button>
          </div>

          {/* 개선점 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              개선점 (개선이 필요한 부분)
            </label>
            {improvements.map((improvement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={improvement}
                  onChange={(e) => handleImprovementChange(index, e.target.value)}
                  placeholder="예: 특정 단계에서 시간이 부족했음"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {improvements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImprovement(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImprovement}
              className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
            >
              + 개선점 추가
            </button>
          </div>

          {/* 제안사항 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제안사항
            </label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={4}
              placeholder="워크숍 설계 개선을 위한 제안사항을 입력해주세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 실행 여부 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={executedAsPlanned}
                onChange={(e) => setExecutedAsPlanned(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">계획대로 실행되었습니다</span>
            </label>
          </div>

          {/* 실제 소요 시간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              실제 소요 시간 (시간, 선택사항)
            </label>
            <input
              type="number"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              placeholder="예: 4.5"
              step="0.5"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              피드백 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// StarIcon 컴포넌트
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default WorkshopFeedbackModal;

