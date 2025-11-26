import React from 'react';
import { createPortal } from 'react-dom';
import { SparklesIcon } from './Icon';

interface LoadingProgressProps {
  message: string;
  progress?: number; // 0-100
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ message, progress }) => {
  const modalContent = (
    <div 
      className="fixed inset-0 w-screen h-screen bg-black/75 flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6">
            <svg className="animate-spin h-20 w-20 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">워크숍 생성 중</h3>
        </div>
      </div>
    </div>
  );

  // Portal을 사용하여 body에 직접 렌더링
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
};

export default LoadingProgress;

