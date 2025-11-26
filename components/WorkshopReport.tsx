import React from 'react';
import { WorkshopReport as WorkshopReportType } from '../types';
import { DocumentTextIcon, PrinterIcon, DocumentDuplicateIcon } from './Icon';

interface WorkshopReportProps {
  report: WorkshopReportType;
  onGeneratePDF?: () => void;
}

const WorkshopReport: React.FC<WorkshopReportProps> = ({ report, onGeneratePDF }) => {
  const handleCopyReport = () => {
    const reportText = `
워크숍 리포트
${'='.repeat(50)}

제목: ${report.title}
요약: ${report.summary}

참여자: ${report.participants}명
소요 시간: ${report.duration}시간

주요 성과:
${report.keyOutcomes.map((outcome, i) => `${i + 1}. ${outcome}`).join('\n')}

Action Plans:
${report.actionPlans.map((plan, i) => `${i + 1}. ${plan.task} (담당: ${plan.owner}, 마감: ${plan.dueDate}, 상태: ${plan.status === 'completed' ? '완료' : plan.status === 'in-progress' ? '진행 중' : '대기'})`).join('\n')}

${report.feedbackSummary ? `피드백 요약:\n${report.feedbackSummary}\n` : ''}
${report.nextSteps ? `다음 단계:\n${report.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(reportText);
    alert('워크숍 리포트가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg shadow-purple-100/50 mt-6 sm:mt-8 animate-fade-in no-print">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <DocumentTextIcon />
          <span>워크숍 리포트</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopyReport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <DocumentDuplicateIcon />
            복사
          </button>
          <button
            onClick={() => {
              if (onGeneratePDF) {
                onGeneratePDF();
              } else {
                window.print();
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <PrinterIcon />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        {/* 기본 정보 */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">워크숍 개요</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">제목:</span> {report.title}</p>
            <p><span className="font-semibold">요약:</span> {report.summary}</p>
            <div className="flex gap-6">
              <p><span className="font-semibold">참여자:</span> {report.participants}명</p>
              <p><span className="font-semibold">소요 시간:</span> {report.duration}시간</p>
            </div>
          </div>
        </div>

        {/* 주요 성과 */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">주요 성과</h3>
          <ul className="space-y-2">
            {report.keyOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plans */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Action Plans</h3>
          <div className="space-y-3">
            {report.actionPlans.map((plan, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-800">{index + 1}. {plan.task}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                    plan.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status === 'completed' ? '완료' : plan.status === 'in-progress' ? '진행 중' : '대기'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>담당자: {plan.owner}</p>
                  <p>마감일: {plan.dueDate}</p>
                  {plan.notes && <p>메모: {plan.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 피드백 요약 */}
        {report.feedbackSummary && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">피드백 요약</h3>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-gray-700 whitespace-pre-line">{report.feedbackSummary}</p>
            </div>
          </div>
        )}

        {/* 다음 단계 */}
        {report.nextSteps && report.nextSteps.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">다음 단계</h3>
            <ul className="space-y-2">
              {report.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 font-bold mt-0.5">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopReport;

