import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { XMarkIcon, ChatBubbleLeftRightIcon } from './Icon';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopPurpose: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, workshopPurpose }) => {
  const { userProfile } = useAuth();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || '');
    }
    setMessage(`워크숍 주제: ${workshopPurpose}\n\n`);
  }, [isOpen, userProfile, workshopPurpose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend/CRM.
    console.log({
      name,
      contact,
      email: userProfile?.email,
      message,
    });
    setIsSubmitted(true);
  };
  
  const handleClose = () => {
    onClose();
    // Allow re-submission if modal is opened again
    setTimeout(() => setIsSubmitted(false), 300);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon/>
                전문가 무료 상담 신청
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon />
            </button>
        </div>

        {isSubmitted ? (
            <div className="text-center py-10">
                <h3 className="text-xl font-bold text-green-600">신청이 완료되었습니다!</h3>
                <p className="mt-2 text-gray-600">Liink 컨설팅의 전문가가 곧 연락드리겠습니다.</p>
                <button 
                    onClick={handleClose}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                    닫기
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                    워크숍의 성공적인 실행을 위해 Liink의 전문 퍼실리테이터가 도와드립니다. 아래 정보를 남겨주시면 빠르게 연락드리겠습니다.
                </p>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">연락처 (전화 또는 이메일)</label>
                    <input type="text" id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">고민 내용 또는 문의사항</label>
                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">
                    무료 상담 신청하기
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;