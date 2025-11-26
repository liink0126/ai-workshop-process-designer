import React, { useState } from 'react';
import { WorkshopPreparation as WorkshopPreparationType } from '../types';
import {
  ClipboardDocumentCheckIcon,
  HomeIcon,
  ListBulletIcon,
  EnvelopeIcon,
  CheckIcon,
} from './Icon';

interface WorkshopPreparationSectionProps {
  preparation: WorkshopPreparationType;
}

const WorkshopPreparationSection: React.FC<WorkshopPreparationSectionProps> = ({ preparation }) => {
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set());

  const handleTaskToggle = (index: number) => {
    setCheckedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg shadow-indigo-100/50 mt-6 sm:mt-8 animate-fade-in no-print">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 mb-6">
        <ClipboardDocumentCheckIcon />
        <span>워크숍 실행 준비</span>
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        워크숍을 성공적으로 진행하기 위해 아래 항목들을 사전에 준비해 주세요.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 준비물 리스트 */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <ListBulletIcon />
            <span>필요한 준비물</span>
          </h3>
          <ul className="space-y-2">
            {preparation.materials.map((material, index) => (
              <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span className="flex-1">{material}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 공간 배치 가이드 */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <HomeIcon />
            <span>공간 배치</span>
          </h3>
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {preparation.roomSetup}
          </div>
        </div>
      </div>

      {/* 사전 준비 작업 체크리스트 */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ClipboardDocumentCheckIcon />
          <span>사전 준비 작업 체크리스트</span>
        </h3>
        <div className="space-y-3">
          {preparation.preWorkshopTasks.map((task, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group"
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                checkedTasks.has(index)
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 group-hover:border-indigo-400'
              }`}>
                {checkedTasks.has(index) && (
                  <CheckIcon className="text-white w-4 h-4" />
                )}
              </div>
              <input
                type="checkbox"
                checked={checkedTasks.has(index)}
                onChange={() => handleTaskToggle(index)}
                className="sr-only"
              />
              <span className={`flex-1 text-sm sm:text-base leading-relaxed ${
                checkedTasks.has(index) ? 'text-gray-500 line-through' : 'text-gray-700'
              }`}>
                {task}
              </span>
            </label>
          ))}
        </div>
        {checkedTasks.size > 0 && (
          <div className="mt-4 text-sm text-indigo-600 font-medium">
            진행률: {checkedTasks.size} / {preparation.preWorkshopTasks.length} 완료
          </div>
        )}
      </div>

      {/* 참여자 사전 안내 */}
      {preparation.participantPreBrief && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-200 shadow-sm mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <EnvelopeIcon />
            <span>참여자 사전 안내</span>
          </h3>
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            {preparation.participantPreBrief}
          </div>
          <button
            onClick={() => {
              const text = preparation.participantPreBrief || '';
              navigator.clipboard.writeText(text);
              alert('참여자 안내 내용이 클립보드에 복사되었습니다.');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            안내 내용 복사하기
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkshopPreparationSection;

