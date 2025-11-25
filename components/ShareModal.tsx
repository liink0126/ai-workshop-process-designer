import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from './Icon';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    workshopId: string;
    workshopTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, workshopId, workshopTitle }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${window.location.origin}${window.location.pathname}?workshop=${workshopId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">워크숍 공유</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        워크숍 제목
                    </label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{workshopTitle}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        공유 링크
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        />
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon />
                                    <span className="hidden sm:inline">복사됨</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">복사</span>
                                    <span className="sm:hidden">복사</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        💡 이 링크를 공유하면 다른 사람이 이 워크숍을 볼 수 있습니다.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

