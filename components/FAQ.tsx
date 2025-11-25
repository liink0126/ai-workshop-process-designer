import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, QuestionMarkCircleIcon, XMarkIcon } from './Icon';

interface FAQProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "시작하기",
    question: "워크숍 설계는 어떻게 시작하나요?",
    answer: "두 가지 방법이 있습니다: 1) 'AI 컨설턴트와 대화 시작하기' 버튼을 클릭하여 간단한 질문에 답하거나, 2) 직접 폼을 작성하여 워크숍 정보를 입력할 수 있습니다. 처음 사용하시는 경우 AI 컨설턴트를 추천합니다."
  },
  {
    category: "시작하기",
    question: "3P란 무엇인가요?",
    answer: "3P는 워크숍 설계의 핵심 요소입니다: Purpose(목적) - 왜 필요한지, Product(결과물) - 무엇을 만들 것인지, Participant(참여자) - 누가 참여하는지. 이 세 가지를 명확히 하면 AI가 더 정확한 워크숍 계획을 설계할 수 있습니다."
  },
  {
    category: "워크숍 생성",
    question: "워크숍 생성에 얼마나 걸리나요?",
    answer: "일반적으로 30초~1분 정도 소요됩니다. 워크숍의 복잡도와 AI 서버 상태에 따라 다를 수 있습니다."
  },
  {
    category: "워크숍 생성",
    question: "생성된 워크숍을 수정할 수 있나요?",
    answer: "네, 가능합니다. 각 단계 카드의 연필 아이콘을 클릭하여 내용을 수정하거나, 왼쪽 핸들을 드래그하여 순서를 변경할 수 있습니다. 또한 양방향 화살표 아이콘으로 AI에게 다른 활동을 제안받을 수도 있습니다."
  },
  {
    category: "저장 및 관리",
    question: "워크숍은 자동으로 저장되나요?",
    answer: "네, 워크숍이 생성되면 자동으로 저장됩니다. 'My History' 탭에서 저장된 모든 워크숍을 확인할 수 있습니다."
  },
  {
    category: "저장 및 관리",
    question: "워크숍을 PDF로 내보낼 수 있나요?",
    answer: "네, 워크숍 계획 화면 우측 상단의 프린터 아이콘을 클릭하면 PDF로 저장할 수 있습니다."
  },
  {
    category: "기술적 문제",
    question: "워크숍이 생성되지 않아요.",
    answer: "다음을 확인해주세요: 1) 인터넷 연결 상태, 2) 모든 필수 항목(Purpose) 입력 여부, 3) 브라우저 콘솔의 오류 메시지. 문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
  },
  {
    category: "기술적 문제",
    question: "로그인이 안 돼요.",
    answer: "Google 계정으로 로그인해야 합니다. 브라우저의 팝업 차단 설정을 확인하고, 쿠키가 활성화되어 있는지 확인해주세요. 문제가 계속되면 다른 브라우저에서 시도해보세요."
  },
  {
    category: "AI 기능",
    question: "AI 진단 채팅이 작동하지 않아요.",
    answer: "AI 서비스 연결에 문제가 있을 수 있습니다. 페이지를 새로고침하거나, 직접 폼을 작성하여 워크숍을 설계할 수도 있습니다."
  },
  {
    category: "AI 기능",
    question: "AI가 제안한 워크숍이 마음에 들지 않아요.",
    answer: "각 단계를 수정하거나, '대체 제안' 기능을 사용하여 다른 활동을 제안받을 수 있습니다. 또한 3P 정보를 더 구체적으로 입력하면 더 나은 결과를 얻을 수 있습니다."
  },
];

const FAQ: React.FC<FAQProps> = ({ onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  const categories = ["전체", ...Array.from(new Set(faqs.map(faq => faq.category)))];
  const filteredFaqs = selectedCategory === "전체" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <QuestionMarkCircleIcon />
            자주 묻는 질문 (FAQ)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUpIcon className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 text-gray-700 bg-gray-50">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            추가 질문이 있으시면 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

