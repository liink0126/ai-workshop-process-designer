import React, { useState } from 'react';
import { XMarkIcon, BookOpenIcon, ChatBubbleLeftRightIcon, SparklesIcon, ClipboardDocumentListIcon, ArrowRightIcon } from './Icon';

interface UserGuideProps {
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "시작하기",
      icon: <ChatBubbleLeftRightIcon />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>AI 진단 컨설턴트</strong>와 대화를 시작하거나, 직접 폼을 작성하여 워크숍을 설계할 수 있습니다.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-800">
              💡 <strong>팁:</strong> 처음 사용하시는 경우 "AI 컨설턴트와 대화 시작하기"를 추천합니다. 
              간단한 질문에 답하면 자동으로 워크숍의 핵심 요소(3P)를 정리해드립니다.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "3P 입력하기",
      icon: <ClipboardDocumentListIcon />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            워크숍의 핵심 3요소를 입력하세요:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Purpose (목적):</strong> 워크숍의 'Why' - 왜 필요한지, 어떤 변화를 만들고 싶은지</li>
            <li><strong>Product (결과물):</strong> 워크숍의 'What' - 끝났을 때 손에 쥐게 될 구체적인 결과물</li>
            <li><strong>Participant (참여자):</strong> 워크숍의 'Who' - 누가 참여하는지, 그들의 특성과 상황</li>
          </ul>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>주의:</strong> 입력 정보가 구체적일수록 AI가 더 정확한 워크숍 계획을 설계합니다.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "워크숍 생성",
      icon: <SparklesIcon />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            모든 정보를 입력한 후 <strong>"AI로 워크숍 설계하기"</strong> 버튼을 클릭하세요.
          </p>
          <p className="text-gray-700">
            AI가 Liink 컨설팅의 전문 지식을 바탕으로 맞춤형 워크숍 계획을 생성합니다. 
            생성에는 약 30초~1분 정도 소요됩니다.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ 생성된 워크숍은 자동으로 저장되며, "My History"에서 언제든지 확인할 수 있습니다.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "워크숍 편집",
      icon: <BookOpenIcon />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            생성된 워크숍 계획을 다음과 같이 편집할 수 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>순서 변경:</strong> 각 단계 카드의 왼쪽 핸들을 드래그하여 순서 변경</li>
            <li><strong>내용 수정:</strong> 각 단계 카드의 연필 아이콘 클릭하여 수정</li>
            <li><strong>대체 제안:</strong> 양방향 화살표 아이콘으로 AI에게 다른 활동 제안받기</li>
            <li><strong>PDF 내보내기:</strong> 우측 상단의 프린터 아이콘으로 PDF 저장</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpenIcon />
            사용자 가이드
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === index
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {step.icon}
                    <span className="font-medium">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRightIcon className="text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </h3>
            {steps[currentStep].content}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              다음
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGuide;

