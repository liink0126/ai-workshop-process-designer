/**
 * 회원 탈퇴 모달 컴포넌트
 * 개인정보 보호법 제21조 (개인정보의 파기) 준수
 */

import React, { useState } from 'react';
import { deleteUserAccount } from '../lib/firebase';

interface AccountDeletionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'confirm' | 'reason' | 'final'>('confirm');
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [agreed, setAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    '서비스가 만족스럽지 않아서',
    '사용 빈도가 낮아서',
    '개인정보 보호 우려',
    '더 나은 대안을 찾아서',
    '일시적으로 사용하지 않을 예정',
    '기타 (직접 입력)',
  ];

  const handleDelete = async () => {
    if (!agreed) {
      alert('탈퇴 안내사항을 확인하고 동의해 주세요.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteUserAccount();
      onSuccess();
    } catch (err: any) {
      setError(err.message || '회원 탈퇴 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-lg mb-2">회원 탈퇴 전 확인해 주세요</h3>
            <div className="text-sm text-red-800 space-y-2">
              <p className="font-semibold">탈퇴 시 삭제되는 정보:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>계정 정보 (이메일, 이름, 프로필)</li>
                <li>생성하신 모든 워크숍 데이터</li>
                <li>저장된 워크숍 히스토리</li>
                <li>서비스 이용 기록</li>
              </ul>
              <p className="font-semibold mt-3 text-red-900">⚠️ 주의사항:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>탈퇴 후 모든 데이터는 즉시 삭제되며 복구할 수 없습니다</strong></li>
                <li>동일한 이메일로 재가입해도 이전 데이터는 복구되지 않습니다</li>
                <li>탈퇴 전 필요한 워크숍 데이터는 다운로드하시기 바랍니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 서비스 개선을 위한 제안:</strong> 서비스가 불편하셨다면 탈퇴 전에 
          피드백을 남겨주시면 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          취소
        </button>
        <button
          onClick={() => setStep('reason')}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
        >
          탈퇴 진행
        </button>
      </div>
    </div>
  );

  const renderReasonStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-3">탈퇴 사유를 선택해 주세요 (선택사항)</h3>
        <p className="text-sm text-gray-600 mb-4">
          더 나은 서비스 개선을 위해 탈퇴 사유를 알려주시면 감사하겠습니다.
        </p>
        <div className="space-y-2">
          {reasons.map((r, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={(e) => setReason(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
        </div>
        {reason === '기타 (직접 입력)' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="탈퇴 사유를 자유롭게 입력해 주세요..."
            className="mt-3 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('confirm')}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          이전
        </button>
        <button
          onClick={() => setStep('final')}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
        >
          다음
        </button>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900 text-lg mb-2">최종 확인</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p className="font-semibold">정말 탈퇴하시겠습니까?</p>
              <p>
                탈퇴하시면 <strong>모든 데이터가 즉시 삭제</strong>되며, 
                <strong className="text-red-700"> 이 작업은 되돌릴 수 없습니다.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">삭제될 데이터 요약</h4>
        <ul className="text-sm text-gray-700 space-y-1.5">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            계정 정보 (이메일, 이름, 프로필)
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            생성하신 모든 워크숍 데이터
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            저장된 워크숍 히스토리
          </li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            위 내용을 모두 확인하였으며, <strong className="text-red-700">모든 데이터가 즉시 삭제되고 복구할 수 없음</strong>을 
            이해했습니다. 회원 탈퇴에 동의합니다.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('reason')}
          disabled={isDeleting}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
        >
          이전
        </button>
        <button
          onClick={handleDelete}
          disabled={!agreed || isDeleting}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              탈퇴 처리 중...
            </>
          ) : (
            '회원 탈퇴'
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        개인정보 보호법 제21조에 따라 탈퇴 즉시 모든 개인정보가 파기됩니다.
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">회원 탈퇴</h2>
              <p className="text-red-100 text-sm mt-1">
                {step === 'confirm' && '탈퇴 전 확인사항'}
                {step === 'reason' && '탈퇴 사유 (선택사항)'}
                {step === 'final' && '최종 확인'}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-white hover:text-red-100 text-2xl disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && renderConfirmStep()}
          {step === 'reason' && renderReasonStep()}
          {step === 'final' && renderFinalStep()}
        </div>
      </div>
    </div>
  );
};

