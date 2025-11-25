import React, { useState, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { Page } from '../App';
import DiagnosticChat from './DiagnosticChat';
import WorkshopForm from './WorkshopForm';
import WorkshopResults from './WorkshopResults';
import ConsultationModal from './ConsultationModal';
import LoadingProgress from './LoadingProgress';
import ErrorMessage from './ErrorMessage';
import { ChatBubbleLeftRightIcon } from './Icon';
import { useWorkshopGeneration } from '../hooks/useWorkshopGeneration';
import { WorkshopData } from '../types';
import { DEFAULT_FORM_STATE } from '../config/constants';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  templateData?: WorkshopData | null;
  onTemplateUsed?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, templateData, onTemplateUsed }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'start' | 'chat' | 'form'>('start');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const {
    formState,
    setFormState,
    workshopPlan,
    setWorkshopPlan,
    analysis,
    isLoading,
    loadingProgress,
    currentLoadingMessage,
    isSuggesting,
    suggestingStepId,
    error,
    isSaved,
    resultsRef,
    handleInputChange,
    handleGenerate,
    handleUpdateStep,
    handleSuggestAlternative,
    handleAiSuggestion,
    handleReset,
    setError,
  } = useWorkshopGeneration({ user, templateData, onTemplateUsed });

  const handleUseExample = useCallback(() => {
    setFormState({
      purpose: '신제품 A의 시장 출시 전략을 수립하고, 관련 부서 간의 명확한 역할과 책임(R&R)을 정의하고자 합니다.',
      product: '마케팅, 영업, 개발팀의 구체적인 실행 과제가 담긴 통합 액션 플랜.',
      participantsInfo: '마케팅, 영업, 개발팀의 팀장 및 핵심 실무자 12명. 각 팀의 목표는 공유하고 있으나, 실행 단계에서의 협업 방식에 대한 구체적인 논의가 부족한 상태.',
      workshopType: '아이디어/전략',
      duration: 8,
      participants: '12',
      flipchartAvailable: true,
    });
    setError(null);
    setWorkshopPlan(null);
    setView('form');
  }, [setFormState, setError, setWorkshopPlan]);

  const handleResetWithView = useCallback(() => {
    handleReset();
    setView('start');
  }, [handleReset]);

  const handleChatComplete = useCallback((data: { purpose: string; product: string; participantsInfo: string; }) => {
    setFormState(prev => ({
      ...prev,
      purpose: data.purpose,
      product: data.product,
      participantsInfo: data.participantsInfo,
    }));
    setView('form');
  }, [setFormState]);

  const handleSort = useCallback((dragItem: number, dragOverItem: number) => {
    if (!workshopPlan) return;
    const workshopPlanClone = [...workshopPlan];
    const draggedItemContent = workshopPlanClone.splice(dragItem, 1)[0];
    workshopPlanClone.splice(dragOverItem, 0, draggedItemContent);
    setWorkshopPlan(workshopPlanClone);
  }, [workshopPlan, setWorkshopPlan]);

  // 템플릿 데이터가 있으면 폼 뷰로 전환
  React.useEffect(() => {
    if (templateData && templateData.plan && templateData.plan.length > 0) {
      setView('form');
    }
  }, [templateData]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gradient">
          AI 워크숍 프로세스 디자이너
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-5xl mx-auto leading-relaxed">
          조직의 문제나 목표를 입력하세요. Liink의 전문 지식을 담은 AI가 <br /> 성공적인 워크숍을 위한 맞춤형 프로세스를 설계해 드립니다.
        </p>
      </div>

      {view === 'start' && (
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 animate-fade-in no-print">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">어디서부터 시작할지 막막하신가요?</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
            AI 진단 컨설턴트와의 간단한 대화를 통해 워크숍의 핵심(3P)을 정의하고 시작할 수 있습니다.
          </p>
          <button
            onClick={() => setView('chat')}
            className="mt-4 sm:mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-base sm:text-lg mx-auto w-full sm:w-auto"
          >
            <ChatBubbleLeftRightIcon />
            <span className="hidden sm:inline">AI 컨설턴트와 대화 시작하기</span>
            <span className="sm:hidden">AI 대화 시작</span>
          </button>
        </div>
      )}
      
      {view === 'chat' && (
        <DiagnosticChat onComplete={handleChatComplete} />
      )}

      {view === 'form' && (
        <>
          <WorkshopForm
            formState={formState}
            isLoading={isLoading}
            isSuggesting={isSuggesting}
            currentLoadingMessage={currentLoadingMessage}
            loadingProgress={loadingProgress}
            onInputChange={handleInputChange}
            onSubmit={handleGenerate}
            onUseExample={handleUseExample}
            onAiSuggestion={handleAiSuggestion}
            onReset={handleResetWithView}
          />
          {isLoading && (
            <LoadingProgress 
              message={currentLoadingMessage}
              progress={loadingProgress}
            />
          )}
        </>
      )}

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError(null)}
          type="error"
        />
      )}

      {workshopPlan && analysis && (
        <WorkshopResults
          workshopPlan={workshopPlan}
          analysis={analysis}
          isSaved={isSaved}
          viewMode={viewMode}
          suggestingStepId={suggestingStepId || null}
          onUpdateStep={handleUpdateStep}
          onSuggestAlternative={handleSuggestAlternative}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onConsult={() => setIsConsultModalOpen(true)}
        />
      )}

      <ConsultationModal 
        isOpen={isConsultModalOpen} 
        onClose={() => setIsConsultModalOpen(false)}
        workshopPurpose={formState.purpose}
      />
    </div>
  );
};

export default HomePage;
