import React, { useState } from 'react';
import { WorkshopFollowUp as WorkshopFollowUpType, ActionPlanItem } from '../types';
import { ClipboardDocumentCheckIcon, ChartBarIcon, EnvelopeIcon, DocumentTextIcon } from './Icon';

interface WorkshopFollowUpProps {
  followUp: WorkshopFollowUpType;
  onActionPlanUpdate?: (actionPlans: ActionPlanItem[]) => void;
}

const WorkshopFollowUp: React.FC<WorkshopFollowUpProps> = ({ followUp, onActionPlanUpdate }) => {
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>(followUp.actionPlans);

  const handleStatusChange = (id: string, status: ActionPlanItem['status']) => {
    const updated = actionPlans.map(plan =>
      plan.id === id ? { ...plan, status } : plan
    );
    setActionPlans(updated);
    if (onActionPlanUpdate) {
      onActionPlanUpdate(updated);
    }
  };

  const getStatusColor = (status: ActionPlanItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: ActionPlanItem['status']) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in-progress':
        return '진행 중';
      default:
        return '대기';
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg shadow-orange-100/50 mt-6 sm:mt-8 animate-fade-in no-print">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 mb-6">
        <ClipboardDocumentCheckIcon />
        <span>워크숍 후속 조치</span>
      </h2>

      {/* Action Plan 추적 */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ClipboardDocumentCheckIcon />
          <span>Action Plan 추적</span>
        </h3>
        <div className="space-y-3">
          {actionPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">{plan.task}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>담당자: {plan.owner}</span>
                    <span>마감일: {plan.dueDate}</span>
                  </div>
                  {plan.notes && (
                    <p className="text-sm text-gray-600 mt-2">{plan.notes}</p>
                  )}
                </div>
                <select
                  value={plan.status}
                  onChange={(e) => handleStatusChange(plan.id, e.target.value as ActionPlanItem['status'])}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(plan.status)}`}
                >
                  <option value="pending">대기</option>
                  <option value="in-progress">진행 중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
          ))}
          <div className="mt-4 flex gap-2 text-sm">
            <span className="text-gray-600">
              완료: {actionPlans.filter(p => p.status === 'completed').length} / {actionPlans.length}
            </span>
            <span className="text-gray-600">
              진행 중: {actionPlans.filter(p => p.status === 'in-progress').length}
            </span>
          </div>
        </div>
      </div>

      {/* 피드백 설문 */}
      {followUp.feedbackSurvey && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-200 shadow-sm mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <EnvelopeIcon />
            <span>참여자 피드백 수집</span>
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-2">설문 목적:</p>
              <p className="text-sm text-indigo-800">{followUp.feedbackSurvey.purpose}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">피드백 질문:</p>
              <ol className="space-y-2">
                {followUp.feedbackSurvey.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                    <span className="text-indigo-600 font-bold mt-0.5">{index + 1}.</span>
                    <span className="flex-1">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
            <button
              onClick={() => {
                const surveyText = `참여자 피드백 설문\n\n목적: ${followUp.feedbackSurvey?.purpose}\n\n질문:\n${followUp.feedbackSurvey?.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
                navigator.clipboard.writeText(surveyText);
                alert('피드백 설문 내용이 클립보드에 복사되었습니다.');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              설문 내용 복사하기
            </button>
          </div>
        </div>
      )}

      {/* 효과 측정 */}
      {followUp.effectivenessMetrics && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-green-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <ChartBarIcon />
            <span>워크숍 효과 측정</span>
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm font-semibold text-green-900 mb-2">측정 가이드:</p>
              <p className="text-sm text-green-800 whitespace-pre-line">{followUp.effectivenessMetrics.measurementGuide}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">효과 측정 질문:</p>
              <ol className="space-y-2">
                {followUp.effectivenessMetrics.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                    <span className="text-green-600 font-bold mt-0.5">{index + 1}.</span>
                    <span className="flex-1">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
            <button
              onClick={() => {
                const metricsText = `워크숍 효과 측정\n\n측정 가이드:\n${followUp.effectivenessMetrics?.measurementGuide}\n\n질문:\n${followUp.effectivenessMetrics?.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
                navigator.clipboard.writeText(metricsText);
                alert('효과 측정 내용이 클립보드에 복사되었습니다.');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              측정 내용 복사하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 아이콘 컴포넌트들
const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l3-3m0 0l3 3m-3-3v12m13-12l3-3m0 0l3 3m-3-3v12M9 7v6m6-6v6" />
  </svg>
);

export default WorkshopFollowUp;

