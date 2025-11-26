import React from 'react';
import { ParticipantManagement as ParticipantManagementType } from '../types';
import { UsersIcon, ClipboardDocumentListIcon } from './Icon';

interface ParticipantManagementProps {
  participantManagement: ParticipantManagementType;
  totalParticipants: number;
}

const ParticipantManagementSection: React.FC<ParticipantManagementProps> = ({ 
  participantManagement, 
  totalParticipants 
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 mt-6 sm:mt-8 animate-fade-in no-print">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 mb-6">
        <UsersIcon />
        <span>참여자 관리 가이드</span>
      </h2>

      {/* 그룹 구성 전략 */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <UsersIcon />
            <span>그룹 구성 전략</span>
          </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">총 참여자</p>
              <p className="text-2xl font-bold text-indigo-600">{totalParticipants}명</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">추천 그룹 수</p>
              <p className="text-2xl font-bold text-purple-600">{participantManagement.groupStrategy.recommendedGroups}그룹</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <p className="text-sm text-gray-600 mb-1">그룹당 인원</p>
              <p className="text-2xl font-bold text-teal-600">{participantManagement.groupStrategy.groupSize}명</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              <span className="font-semibold">구성 전략:</span> {participantManagement.groupStrategy.strategy}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">사용 가능한 그룹 구성 옵션:</p>
            <div className="flex flex-wrap gap-2">
              {participantManagement.groupStrategy.groupingOptions.map((option, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 역할 분담 가이드 */}
      {participantManagement.roleAssignment && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon />
            <span>역할 분담 가이드</span>
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">역할 목록:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {participantManagement.roleAssignment.roles.map((role, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 text-center"
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {participantManagement.roleAssignment.assignmentGuide}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 사전 조사 항목 */}
      {participantManagement.preWorkshopSurvey && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon />
            <span>참여자 사전 조사</span>
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-2">조사 목적:</p>
              <p className="text-sm text-indigo-800">{participantManagement.preWorkshopSurvey.purpose}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">조사 질문:</p>
              <ol className="space-y-2">
                {participantManagement.preWorkshopSurvey.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                    <span className="text-indigo-600 font-bold mt-0.5">{index + 1}.</span>
                    <span className="flex-1">{question}</span>
                  </li>
                ))}
              </ol>
            </div>
            <button
              onClick={() => {
                const surveyText = `참여자 사전 조사\n\n목적: ${participantManagement.preWorkshopSurvey?.purpose}\n\n질문:\n${participantManagement.preWorkshopSurvey?.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
                navigator.clipboard.writeText(surveyText);
                alert('사전 조사 내용이 클립보드에 복사되었습니다.');
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              조사 내용 복사하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManagementSection;

