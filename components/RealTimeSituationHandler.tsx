import React, { useState } from 'react';
import { RealTimeSituation, SituationResponse, WorkshopStep, WorkshopData } from '../types';
import { ExclamationTriangleIcon, LightBulbIcon, ArrowPathIcon, CheckIcon } from './Icon';
import { analyzeSituationAndGetResponse } from '../services/situationService';

interface RealTimeSituationHandlerProps {
  currentPlan: WorkshopStep[];
  currentStepIndex: number;
  workshopContext: WorkshopData;
  onPlanUpdate?: (updatedPlan: WorkshopStep[]) => void;
  onSituationLogged?: (situation: RealTimeSituation, response: SituationResponse) => void;
}

const SITUATION_TYPES: RealTimeSituation['type'][] = [
  '참여도 저하',
  '시간 부족',
  '시간 여유',
  '갈등 발생',
  '기술 장애',
  '참여자 이탈',
  '주제 이탈',
  '기타'
];

const RealTimeSituationHandler: React.FC<RealTimeSituationHandlerProps> = ({
  currentPlan,
  currentStepIndex,
  workshopContext,
  onPlanUpdate,
  onSituationLogged
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [situationType, setSituationType] = useState<RealTimeSituation['type']>('참여도 저하');
  const [severity, setSeverity] = useState<RealTimeSituation['severity']>('medium');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<SituationResponse | null>(null);
  const [situations, setSituations] = useState<Array<RealTimeSituation & { response?: SituationResponse }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('상황 설명을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setResponse(null);

    const situation: RealTimeSituation = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: situationType,
      description: description.trim(),
      currentStepId: currentPlan[currentStepIndex]?.id,
      severity
    };

    try {
      const analysisResponse = await analyzeSituationAndGetResponse(
        situation,
        currentPlan,
        workshopContext,
        currentStepIndex
      );

      setResponse(analysisResponse);
      setSituations(prev => [...prev, { ...situation, response: analysisResponse }]);
      
      if (onSituationLogged) {
        onSituationLogged(situation, analysisResponse);
      }

      // 대안 단계가 있으면 제안
      if (analysisResponse.alternativeSteps && analysisResponse.alternativeSteps.length > 0) {
        // 사용자에게 대안 적용 여부 확인
        const shouldApply = window.confirm(
          `AI가 ${analysisResponse.alternativeSteps.length}개의 대안 활동을 제안했습니다. 적용하시겠습니까?`
        );
        
        if (shouldApply && onPlanUpdate) {
          // 현재 단계를 첫 번째 대안으로 교체
          const updatedPlan = [...currentPlan];
          const alternativeStep = {
            ...analysisResponse.alternativeSteps[0],
            id: currentPlan[currentStepIndex]?.id || crypto.randomUUID()
          };
          updatedPlan[currentStepIndex] = alternativeStep as WorkshopStep;
          onPlanUpdate(updatedPlan);
        }
      }

      // 프로세스 조정 제안
      if (analysisResponse.processAdjustments) {
        const adjustments = analysisResponse.processAdjustments;
        let adjustmentMessage = '프로세스 조정 제안:\n';
        
        if (adjustments.skipSteps && adjustments.skipSteps.length > 0) {
          adjustmentMessage += `- 건너뛸 단계: ${adjustments.skipSteps.join(', ')}\n`;
        }
        if (adjustments.extendSteps && adjustments.extendSteps.length > 0) {
          adjustmentMessage += `- 시간 연장: ${adjustments.extendSteps.map(e => `${e.stepId} (+${e.additionalMinutes}분)`).join(', ')}\n`;
        }
        
        if (adjustmentMessage !== '프로세스 조정 제안:\n') {
          alert(adjustmentMessage);
        }
      }

      // 입력 초기화
      setDescription('');
    } catch (error) {
      console.error('상황 분석 실패:', error);
      alert('상황 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 no-print">
      {/* 상황 입력 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium transition-all transform hover:scale-105"
        >
          <ExclamationTriangleIcon />
          <span>실시간 상황 입력</span>
        </button>
      )}

      {/* 상황 입력 패널 */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ExclamationTriangleIcon />
              실시간 상황 입력
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setResponse(null);
                setDescription('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* 상황 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상황 유형
              </label>
              <select
                value={situationType}
                onChange={(e) => setSituationType(e.target.value as RealTimeSituation['type'])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {SITUATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 심각도 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                심각도
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      severity === level
                        ? level === 'high' ? 'bg-red-600 text-white' :
                          level === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'high' ? '높음' : level === 'medium' ? '보통' : '낮음'}
                  </button>
                ))}
              </div>
            </div>

            {/* 상황 설명 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상황 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="발생한 상황을 구체적으로 설명해주세요..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !description.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  분석 중...
                </>
              ) : (
                <>
                  <LightBulbIcon />
                  AI 분석 요청
                </>
              )}
            </button>
          </form>

          {/* 분석 결과 */}
          {response && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckIcon />
                AI 분석 결과
              </h4>

              {/* 상황 분석 */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">상황 분석</p>
                <p className="text-sm text-blue-800">{response.analysis}</p>
              </div>

              {/* 권장 조치 */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">즉시 실행 가능한 조치</p>
                <ul className="space-y-1">
                  {response.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-600 font-bold mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 긴급 가이드 */}
              {response.emergencyGuide && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-1">긴급 대응 가이드</p>
                  <p className="text-sm text-red-800 whitespace-pre-line">{response.emergencyGuide}</p>
                </div>
              )}

              {/* 대안 단계 */}
              {response.alternativeSteps && response.alternativeSteps.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">대안 활동 제안</p>
                  <div className="space-y-2">
                    {response.alternativeSteps.map((step, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-800">{step.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{step.duration}분 • {step.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 이전 상황 기록 */}
          {situations.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">이전 상황 기록</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {situations.slice().reverse().map((sit) => (
                  <div key={sit.id} className="bg-gray-50 p-2 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700">{sit.type}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        sit.severity === 'high' ? 'bg-red-100 text-red-800' :
                        sit.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {sit.severity === 'high' ? '높음' : sit.severity === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>
                    <p className="text-gray-600 truncate">{sit.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {sit.timestamp.toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeSituationHandler;

