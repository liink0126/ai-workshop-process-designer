import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { Page } from '../App';
import DiagnosticChat from './DiagnosticChat';
import WorkshopFormContainer from './WorkshopFormContainer';
import WorkshopResultsContainer from './WorkshopResultsContainer';
import ConsultationModal from './ConsultationModal';
import ProcessOptionsSelector from './ProcessOptionsSelector';
import WorkshopFeedbackModal from './WorkshopFeedbackModal';
import { ChatBubbleLeftRightIcon } from './Icon';
import { useWorkshopGeneration } from '../hooks/useWorkshopGeneration';
import { WorkshopData } from '../types';
import { DEFAULT_FORM_STATE } from '../config/constants';
import { saveWorkshopFeedback } from '../lib/firebase';
import { extractParticipantCount } from '../utils/extractParticipants';

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
    preparation,
    participantManagement,
    execution,
    followUp,
    processOptions,
    isLoading,
    isGeneratingOptions,
    loadingProgress,
    currentLoadingMessage,
    isSuggesting,
    suggestingStepId,
    error,
    isSaved,
    savedWorkshopId,
    resultsRef,
    handleInputChange,
    handleGenerate,
    handleGenerateMultiple,
    handleSelectOptions,
    handleUpdateStep,
    handleSuggestAlternative,
    handleAiSuggestion,
    handleReset,
    setError,
  } = useWorkshopGeneration({ user, templateData, onTemplateUsed });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleUseExample = useCallback(() => {
    // 기존에 입력된 정보가 있는지 확인
    const hasExistingData = formState.purpose || formState.product || formState.participantsInfo;
    
    if (hasExistingData) {
      const confirmed = window.confirm(
        '예제 데이터를 사용하면 현재 입력하신 내용이 모두 삭제됩니다.\n\n계속하시겠습니까?'
      );
      if (!confirmed) {
        return;
      }
    }
    
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
  }, [setFormState, setError, setWorkshopPlan, formState]);

  const handleResetWithView = useCallback(() => {
    const hasData = formState.purpose || formState.product || formState.participantsInfo || workshopPlan;
    
    if (hasData) {
      const confirmed = window.confirm(
        '모든 입력 내용과 생성된 워크숍 프로세스가 삭제되고 초기 화면으로 돌아갑니다.\n\n이 작업은 되돌릴 수 없습니다.\n\n계속하시겠습니까?'
      );
      if (!confirmed) {
        return;
      }
    }
    
    handleReset();
    setView('start');
  }, [handleReset, formState, workshopPlan]);

  const handleChatComplete = useCallback((data: { purpose: string; product: string; participantsInfo: string; }) => {
    // participantsInfo에서 인원수 추출
    const participantCount = extractParticipantCount(data.participantsInfo);
    
    setFormState({
      ...formState,
      purpose: data.purpose,
      product: data.product,
      participantsInfo: data.participantsInfo,
      // 인원수가 추출되면 자동으로 반영, 없으면 기본값 유지
      participants: participantCount ? String(participantCount) : formState.participants || '10',
    });
    setView('form');
  }, [setFormState, formState]);

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
        <WorkshopFormContainer
          formState={formState}
          isLoading={isLoading}
          isGeneratingOptions={isGeneratingOptions}
          isSuggesting={isSuggesting}
          currentLoadingMessage={currentLoadingMessage}
          loadingProgress={loadingProgress}
          error={error}
          onInputChange={handleInputChange}
          onSubmit={handleGenerate}
          onUseExample={handleUseExample}
          onAiSuggestion={handleAiSuggestion}
          onReset={handleResetWithView}
          onGenerateMultiple={handleGenerateMultiple}
          onErrorClose={() => setError(null)}
        />
      )}

      {workshopPlan && analysis && (
        <WorkshopResultsContainer
          workshopPlan={workshopPlan}
          analysis={analysis}
          preparation={preparation}
          participantManagement={participantManagement}
          execution={execution}
          followUp={followUp}
          processOptions={processOptions}
          formState={formState}
          isSaved={isSaved}
          viewMode={viewMode}
          suggestingStepId={suggestingStepId}
          onUpdateStep={handleUpdateStep}
          onSuggestAlternative={handleSuggestAlternative}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onPlanUpdate={(updatedPlan) => setWorkshopPlan(updatedPlan)}
          onConsult={() => setIsConsultModalOpen(true)}
          onFeedback={() => setShowFeedbackModal(true)}
          onSelectOptions={handleSelectOptions}
        />
      )}

      {/* 프로세스 옵션 선택 모달 */}
      {processOptions && (
        <ProcessOptionsSelector
          options={processOptions}
          onSelect={handleSelectOptions}
          onCancel={() => setProcessOptions(null)}
          minSelect={1}
          maxSelect={3}
        />
      )}

      <ConsultationModal 
        isOpen={isConsultModalOpen} 
        onClose={() => setIsConsultModalOpen(false)}
        workshopPurpose={formState.purpose}
      />

      {/* 워크숍 피드백 모달 */}
      {workshopPlan && (
        <WorkshopFeedbackModal
          isOpen={showFeedbackModal}
          workshopId={''} // TODO: 실제 워크숍 ID 사용
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={(feedback) => {
            // TODO: 피드백 저장 로직 구현
            console.log('피드백 제출:', feedback);
            alert('피드백이 제출되었습니다. 감사합니다!');
            setShowFeedbackModal(false);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
