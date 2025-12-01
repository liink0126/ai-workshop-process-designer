/**
 * AI 생성 콘텐츠 표시 컴포넌트
 * 인공지능기본법 제31조 제2항 준수
 */

import React from 'react';

interface AIBadgeProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const AIBadge: React.FC<AIBadgeProps> = ({ variant = 'default', className = '' }) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded ${className}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI 생성
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="text-xs text-purple-800 space-y-2">
            <div>
              <p className="font-bold mb-1">AI 생성 콘텐츠</p>
              <p className="text-purple-700">
                이 내용은 생성형 인공지능(Google Gemini)에 의해 자동으로 생성되었습니다. 
                AI는 실수를 할 수 있으므로, <strong>워크숍 실행 전 반드시 전문가가 내용을 검토하고 필요시 수정해 주세요.</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <p className="text-purple-700">
                <strong>⚠️ 책임 고지:</strong> AI가 생성한 워크숍 프로세스의 실행 결과 및 효과에 대한 책임은 사용자에게 있습니다. 
                중요한 워크숍의 경우 전문 퍼실리테이터의 검토를 권장합니다.
              </p>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <p className="text-xs text-purple-600">
                📚 Liink Consulting의 10년 이상 축적된 워크숍 설계 노하우 및 교육 자료 기반
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200 ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>AI로 생성된 워크숍</span>
    </div>
  );
};

interface AIContentWrapperProps {
  children: React.ReactNode;
  showBadge?: boolean;
  badgePosition?: 'top' | 'bottom';
}

export const AIContentWrapper: React.FC<AIContentWrapperProps> = ({ 
  children, 
  showBadge = true,
  badgePosition = 'top'
}) => {
  return (
    <div className="relative">
      {showBadge && badgePosition === 'top' && (
        <div className="mb-4">
          <AIBadge variant="detailed" />
        </div>
      )}
      
      {children}
      
      {showBadge && badgePosition === 'bottom' && (
        <div className="mt-4">
          <AIBadge variant="detailed" />
        </div>
      )}
    </div>
  );
};

