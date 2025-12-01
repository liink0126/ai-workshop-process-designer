/**
 * AI 투명성 확보 의무 준수 컴포넌트
 * 인공지능기본법 제31조 준수
 */

import React, { useState } from 'react';

interface AIDisclosureModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const AIDisclosureModal: React.FC<AIDisclosureModalProps> = ({ onAccept, onDecline }) => {
  const [agreedToAI, setAgreedToAI] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canProceed = agreedToAI && agreedToTerms && agreedToPrivacy;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold">AI 서비스 이용 안내</h2>
              <p className="text-indigo-100 text-sm mt-1">인공지능기본법 제31조에 따른 투명성 고지</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI 사용 고지 */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">생성형 AI 기반 서비스</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>본 서비스는 <strong>Google Gemini AI</strong>를 활용한 생성형 인공지능 기반 워크숍 설계 도구입니다.</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>워크숍 프로세스, 준비물, 퍼실리테이션 가이드 등이 AI에 의해 생성됩니다</li>
                    <li>AI가 생성한 모든 결과물에는 "AI 생성" 표시가 포함됩니다</li>
                    <li>생성된 내용은 참고용이며, 전문가의 검토가 필요할 수 있습니다</li>
                    <li>입력하신 정보는 AI 분석에 사용되며, 생성 품질 향상을 위해 처리됩니다</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>📚 AI 학습 데이터 출처:</strong> 본 AI는 <strong>Liink Consulting</strong>의 10년 이상 축적된 
                      워크숍 설계 노하우, 퍼실리테이션 방법론, 실제 교육 자료 및 프로세스 디자인 사례를 기반으로 학습되었습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 법적 고지사항 */}
          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              법적 고지사항
            </h3>
            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded">
              <p><strong>• 결과물의 정확성:</strong> AI가 생성한 워크숍 프로세스는 일반적인 가이드라인이며, 특정 상황에 맞게 조정이 필요할 수 있습니다.</p>
              <p><strong>• 책임의 한계:</strong> 생성된 워크숍 프로세스의 실행 결과에 대한 책임은 사용자에게 있으며, 본 서비스는 도구 제공에 한정됩니다.</p>
              <p><strong>• 전문가 검토 권장:</strong> 중요한 워크숍의 경우 전문 퍼실리테이터의 검토를 권장합니다.</p>
              <p><strong>• 데이터 처리:</strong> 입력된 정보는 AI 생성 목적으로만 사용되며, 제3자에게 제공되지 않습니다.</p>
            </div>
          </section>

          {/* 동의 체크박스 */}
          <section className="space-y-3 border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToAI}
                onChange={(e) => setAgreedToAI(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                본 서비스가 <strong>생성형 인공지능(Google Gemini)</strong>을 기반으로 운영되며, 모든 결과물이 AI에 의해 생성됨을 이해하고 동의합니다. <span className="text-red-600">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                <button 
                  type="button"
                  onClick={() => window.open('#terms', '_blank')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  이용약관
                </button>에 동의합니다. <span className="text-red-600">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                <button 
                  type="button"
                  onClick={() => window.open('#privacy', '_blank')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  개인정보 처리방침
                </button>에 동의합니다. <span className="text-red-600">*</span>
              </span>
            </label>
          </section>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              동의하지 않음
            </button>
            <button
              onClick={onAccept}
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                canProceed
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              동의하고 시작하기
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            본 고지는 인공지능기본법 제31조(인공지능 투명성 확보 의무)에 따라 제공됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

