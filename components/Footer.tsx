import React, { useState, lazy, Suspense } from 'react';

const TermsOfService = lazy(() => import('./TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));

const Footer: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 text-gray-500 py-8 no-print">
        <div className="container mx-auto px-4 space-y-4">
          {/* AI 법적 고지 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="flex items-start gap-2 text-xs text-purple-900">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-bold mb-1">AI 서비스 투명성 고지 (인공지능기본법 제31조)</p>
                  <p className="text-purple-800">
                    본 서비스는 <strong>생성형 인공지능(Google Gemini)</strong>을 기반으로 운영되며, 
                    워크숍 프로세스, 준비물, 퍼실리테이션 가이드 등의 결과물은 AI에 의해 자동으로 생성됩니다.
                  </p>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-purple-800">
                    <strong>⚠️ 중요:</strong> AI는 실수를 할 수 있으므로, 생성된 내용을 실제 워크숍에 적용하기 전에 
                    반드시 전문가가 검토해 주세요. 워크숍 실행 결과에 대한 책임은 사용자에게 있습니다.
                  </p>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-700">
                    📚 <strong>AI 학습 데이터:</strong> Liink Consulting의 10년 이상 축적된 워크숍 설계 노하우, 
                    퍼실리테이션 방법론, 교육 자료 및 프로세스 디자인 사례 기반
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 링크 및 저작권 */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-4 text-sm">
              <button
                onClick={() => setShowTerms(true)}
                className="text-gray-600 hover:text-indigo-600 transition-colors underline"
              >
                이용약관
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-gray-600 hover:text-indigo-600 transition-colors underline"
              >
                개인정보 처리방침
              </button>
            </div>
            <p className="text-sm">Copyright 2025 @Liink Consulting, all rights reserved.</p>
            <p className="text-xs text-gray-400">
              본 서비스는 대한민국 인공지능기본법, 개인정보 보호법, 정보통신망법을 준수합니다.
            </p>
          </div>
        </div>
      </footer>

      {/* 모달 */}
      {showTerms && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">로딩 중...</div>
          </div>
        }>
          <TermsOfService onClose={() => setShowTerms(false)} />
        </Suspense>
      )}
      {showPrivacy && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">로딩 중...</div>
          </div>
        }>
          <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
        </Suspense>
      )}
    </>
  );
};

export default Footer;