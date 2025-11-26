import React, { memo } from 'react';
import { PencilSquareIcon, ClockIcon, UsersIcon, RocketLaunchIcon, LightBulbIcon, ArrowPathIcon, ClipboardDocumentListIcon, SparklesIcon } from './Icon';
import { WORKSHOP_TYPES, DEFAULT_FORM_STATE, WORKSHOP_DURATION_OPTIONS, PARTICIPANT_LIMITS } from '../config/constants';
import { sanitizeInput } from '../utils/sanitize';

interface WorkshopFormProps {
  formState: typeof DEFAULT_FORM_STATE;
  isLoading: boolean;
  isSuggesting: boolean;
  currentLoadingMessage: string;
  loadingProgress: number;
  onInputChange: (field: keyof typeof DEFAULT_FORM_STATE, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUseExample: () => void;
  onAiSuggestion: () => void;
  onReset: () => void;
  onGenerateMultiple?: () => void;
}

const WorkshopForm: React.FC<WorkshopFormProps> = memo(({
  formState,
  isLoading,
  isSuggesting,
  currentLoadingMessage,
  loadingProgress,
  onInputChange,
  onSubmit,
  onUseExample,
  onAiSuggestion,
  onReset,
  onGenerateMultiple,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 no-print animate-fade-in">
      <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 border-b border-gray-200 pb-2 sm:pb-3">
            <PencilSquareIcon />
            워크숍 기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label htmlFor="duration" className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <ClockIcon /> 총 소요 시간
              </label>
              <select 
                id="duration" 
                value={formState.duration}
                onChange={(e) => onInputChange('duration', parseInt(e.target.value, 10))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
              >
                {Array.from({ length: WORKSHOP_DURATION_OPTIONS.MAX_SINGLE_DAY }, (_, i) => i + 1).map(hour => (
                  <option key={hour} value={hour}>
                    {hour}시간{hour === WORKSHOP_DURATION_OPTIONS.MAX_SINGLE_DAY ? ' (1일)' : ''}
                  </option>
                ))}
                <option value={WORKSHOP_DURATION_OPTIONS.TWO_DAYS}>{WORKSHOP_DURATION_OPTIONS.TWO_DAYS}시간 (2일)</option>
                <option value={WORKSHOP_DURATION_OPTIONS.THREE_DAYS}>{WORKSHOP_DURATION_OPTIONS.THREE_DAYS}시간 (3일)</option>
              </select>
            </div>
            <div>
              <label htmlFor="participants" className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <UsersIcon /> 참여자 수 (명)
              </label>
              <input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="participants"
                value={formState.participants}
                onChange={(e) => onInputChange('participants', e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={() => {
                  const num = parseInt(formState.participants, 10);
                  if (isNaN(num) || num < PARTICIPANT_LIMITS.MIN) {
                    onInputChange('participants', String(PARTICIPANT_LIMITS.MIN));
                  } else if (num > PARTICIPANT_LIMITS.MAX) {
                    onInputChange('participants', String(PARTICIPANT_LIMITS.MAX));
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
              />
            </div>
            <div>
              <label htmlFor="workshopType" className="block text-base font-medium text-gray-700 mb-2">워크숍 유형</label>
              <select 
                id="workshopType" 
                value={formState.workshopType}
                onChange={(e) => onInputChange('workshopType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
              >
                {WORKSHOP_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">플립차트 사용 가능 여부</label>
              <div className="flex items-center gap-4 p-3 border border-gray-300 rounded-lg bg-gray-50/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="flipchart" 
                    checked={formState.flipchartAvailable} 
                    onChange={() => onInputChange('flipchartAvailable', true)} 
                    className="form-radio text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>사용 가능</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="flipchart" 
                    checked={!formState.flipchartAvailable} 
                    onChange={() => onInputChange('flipchartAvailable', false)} 
                    className="form-radio text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>사용 불가</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 border-b border-gray-200 pb-2 sm:pb-3">
            <ClipboardDocumentListIcon />
            <span className="hidden sm:inline">3P 분석 (Purpose, Product, Participant)</span>
            <span className="sm:hidden">3P 분석</span>
          </h2>
          <div className="space-y-6 pt-2">
            <div>
              <label htmlFor="purpose" className="block text-base font-medium mb-2">
                <span className="font-semibold text-gray-800">1. 워크숍 목적</span>
                <span className="ml-1.5 text-gray-500 font-normal">(Purpose)</span>
              </label>
              <textarea
                id="purpose"
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
                placeholder="예: 신제품 출시 전략 수립 및 부서별 R&R 정의"
                value={formState.purpose}
                onChange={(e) => onInputChange('purpose', sanitizeInput(e.target.value || ''))}
                disabled={isLoading}
              />
              <p className="mt-1.5 text-sm text-gray-500">
                워크숍의 'Why'입니다. 어떤 배경에서 필요하며, 이 시간을 통해 만들고 싶은 근본적인 변화는 무엇인가요? AI가 워크숍의 핵심 컨셉을 잡는 가장 중요한 정보입니다.
              </p>
            </div>
            <div>
              <label htmlFor="product" className="block text-base font-medium mb-2">
                <span className="font-semibold text-gray-800">2. 핵심 결과물</span>
                <span className="ml-1.5 text-gray-500 font-normal">(Product)</span>
              </label>
              <textarea
                id="product"
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
                placeholder="예: 실행 과제가 담긴 통합 액션 플랜, 의사결정 원칙 합의문"
                value={formState.product}
                onChange={(e) => onInputChange('product', sanitizeInput(e.target.value || ''))}
                disabled={isLoading}
              />
              <p className="mt-1.5 text-sm text-gray-500">
                워크숍의 'What'입니다. 워크숍이 끝났을 때 참여자들이 손에 쥐고 가져갈 유형/무형의 결과물을 명확하게 정의해주세요.
              </p>
            </div>
            <div>
              <label htmlFor="participants-info" className="block text-base font-medium mb-2">
                <span className="font-semibold text-gray-800">3. 참여자 정보</span>
                <span className="ml-1.5 text-gray-500 font-normal">(Participant)</span>
              </label>
              <textarea
                id="participants-info"
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50/50"
                placeholder="예: 마케팅, 영업, 개발팀 팀장 및 실무자 12명. 평소 협업이 적어 서로의 업무 이해도가 낮음."
                value={formState.participantsInfo}
                onChange={(e) => onInputChange('participantsInfo', sanitizeInput(e.target.value || ''))}
                disabled={isLoading}
              />
              <p className="mt-1.5 text-sm text-gray-500">
                워크숍의 'Who'입니다. 참여자들의 직급, 역할, 성향, 관계, 사전 기대 등을 구체적으로 묘사할수록 AI가 맞춤형 활동을 설계하는 데 도움이 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={onUseExample} 
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                title="예시 데이터로 빠르게 채우기"
              >
                <RocketLaunchIcon /> 
                <span className="hidden sm:inline">예제 사용하기</span>
                <span className="sm:hidden">예제</span>
              </button>
              <button 
                type="button" 
                onClick={onAiSuggestion} 
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
                disabled={isSuggesting} 
                title="선택한 워크숍 유형에 맞는 3P 예시를 AI에게 추천받기"
              >
                {isSuggesting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <LightBulbIcon />
                )}
                <span className="hidden sm:inline">AI 추천 받기</span>
                <span className="sm:hidden">AI 추천</span>
              </button>
            </div>
            <button 
              type="button" 
              onClick={onReset} 
              className="px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" 
              title="모든 입력 내용 초기화"
            >
              <ArrowPathIcon /> 초기화
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">{currentLoadingMessage}</span>
                <span className="sm:hidden">생성 중...</span>
              </>
            ) : (
              <>
                <SparklesIcon />
                <span className="hidden sm:inline">AI로 워크숍 설계하기</span>
                <span className="sm:hidden">워크숍 설계</span>
              </>
            )}
          </button>
          {onGenerateMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onGenerateMultiple();
              }}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <SparklesIcon />
              <span>여러 옵션 생성하기 (1-3개)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

WorkshopForm.displayName = 'WorkshopForm';

export default WorkshopForm;

