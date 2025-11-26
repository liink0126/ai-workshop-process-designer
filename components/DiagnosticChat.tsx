import React, { useState, useEffect, useRef } from 'react';
import { generate3PFromChat } from '../services/geminiService';
import { ChatBubbleLeftRightIcon } from './Icon';
import { sanitizeInput } from '../utils/sanitize';

interface Message {
    author: 'ai' | 'user';
    text: string;
}

interface DiagnosticChatProps {
    onComplete: (data: { purpose: string; product: string; participantsInfo: string; }) => void;
}

const questions = [
    "안녕하세요! 저는 Liink의 AI 진단 컨설턴트입니다. 어떤 조직의 문제나 목표를 가지고 계신가요? 편하게 말씀해주세요.",
    "그렇군요. 해당 이슈가 해결되었을 때, 가장 이상적으로 기대하는 결과물은 무엇인가요? (예: 구체적인 실행 계획, 구성원들의 변화된 행동 등)",
    "마지막으로, 이 워크숍에 참여할 사람들은 누구이며, 그들의 현재 상황이나 입장은 어떤가요? (예: 팀장급 10명, 서로 협업이 적음)",
];

const exampleAnswers: string[][] = [
    // Examples for Question 1
    [
        "신규 입사자들의 온보딩 경험을 개선하고, 팀에 빠르게 적응하도록 돕고 싶습니다.",
        "최근 팀원들의 소통이 줄고, 부서 간 협업에 어려움을 겪고 있습니다."
    ],
    // Examples for Question 2
    [
        "신규 입사자들이 회사 문화와 업무 프로세스를 이해하고, 다음 분기 개인 목표를 설정하는 것.",
        "팀의 문제점을 솔직하게 공유하고, 해결을 위한 구체적인 액션 플랜 3가지를 도출하는 것."
    ],
    // Examples for Question 3
    [
        "입사 3개월 미만의 신규 입사자 8명. 아직 회사에 대해 잘 모르고, 서로 서먹한 상태입니다.",
        "개발팀과 기획팀의 팀장 및 핵심 실무자 15명. 서로의 업무에 대한 이해도가 낮고, 갈등이 있습니다."
    ]
];


const DiagnosticChat: React.FC<DiagnosticChatProps> = ({ onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ author: 'ai', text: questions[0] }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentInput.trim() || isProcessing) return;

        const newAnswers = [...answers, currentInput.trim()];
        setAnswers(newAnswers);
        setMessages(prev => [...prev, { author: 'user', text: currentInput.trim() }]);
        setCurrentInput('');

        const nextQuestionIndex = newAnswers.length;
        if (nextQuestionIndex < questions.length) {
            setTimeout(() => {
                 setMessages(prev => [...prev, { author: 'ai', text: questions[nextQuestionIndex] }]);
            }, 500);
        } else {
            setIsProcessing(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { author: 'ai', text: "좋습니다. 잠시만 기다려주시면 입력하신 내용을 바탕으로 워크숍의 핵심 3요소를 정리해 드릴게요." }]);
            }, 500);
            
            try {
                const result = await generate3PFromChat(newAnswers);
                onComplete(result);
            } catch (error) {
                console.error('3P 분석 실패:', error);
                // Exit chat on error, allowing user to fill form manually
                // 사용자가 입력한 내용을 그대로 사용
                onComplete({ 
                    purpose: newAnswers[0] || '', 
                    product: newAnswers[1] || '', 
                    participantsInfo: newAnswers[2] || '',
                });
            }
        }
    };
    
    const currentQuestionIndex = answers.length;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 animate-fade-in">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
                <ChatBubbleLeftRightIcon />
                AI 진단 컨설턴트
            </h2>
            <div className="h-80 overflow-y-auto pr-4 space-y-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.author === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>}
                        <div className={`max-w-md p-3 rounded-2xl ${msg.author === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex items-end gap-2 justify-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>
                        <div className="max-w-md p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm text-gray-500">분석 중...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit}>
                <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(sanitizeInput(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50"
                    placeholder="답변을 입력하세요... (Shift+Enter로 줄바꿈)"
                    disabled={isProcessing || answers.length >= questions.length}
                />
                <button type="submit" disabled={!currentInput.trim() || isProcessing || answers.length >= questions.length} className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    답변 보내기
                </button>
            </form>
            
            {!isProcessing && currentQuestionIndex < questions.length && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium mr-1">예시 답변:</span>
                    {exampleAnswers[currentQuestionIndex].map((example, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentInput(example)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiagnosticChat;