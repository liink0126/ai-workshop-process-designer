/**
 * 워크숍 결과 컨테이너 컴포넌트
 * 결과 표시 관련 로직을 분리
 */

import React, { useMemo } from 'react';
import WorkshopResults from './WorkshopResults';
import ProcessOptionsSelector from './ProcessOptionsSelector';
import type {
  WorkshopStep,
  WorkshopAnalysis,
  WorkshopPreparation,
  ParticipantManagement,
  WorkshopExecution,
  WorkshopFollowUp,
  ProcessOption,
  WorkshopData,
} from '../types';

interface WorkshopResultsContainerProps {
  workshopPlan: WorkshopStep[] | null;
  analysis: WorkshopAnalysis | null;
  preparation: WorkshopPreparation | null;
  participantManagement: ParticipantManagement | null;
  execution: WorkshopExecution | null;
  followUp: WorkshopFollowUp | null;
  processOptions: ProcessOption[] | null;
  formState: {
    purpose: string;
    product: string;
    participantsInfo: string;
    workshopType: string;
    duration: number;
    participants: string;
    flipchartAvailable: boolean;
  };
  isSaved: boolean;
  viewMode: 'list' | 'timeline';
  suggestingStepId: string | null;
  onUpdateStep: (updatedStep: WorkshopStep) => void;
  onSuggestAlternative: (stepId: string) => void;
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  onSort: (dragItem: number, dragOverItem: number) => void;
  onPlanUpdate?: (updatedPlan: WorkshopStep[]) => void;
  onConsult: () => void;
  onFeedback: () => void;
  onSelectOptions: (options: ProcessOption[]) => void;
}

const WorkshopResultsContainer: React.FC<WorkshopResultsContainerProps> = ({
  workshopPlan,
  analysis,
  preparation,
  participantManagement,
  execution,
  followUp,
  processOptions,
  formState,
  isSaved,
  viewMode,
  suggestingStepId,
  onUpdateStep,
  onSuggestAlternative,
  onViewModeChange,
  onSort,
  onPlanUpdate,
  onConsult,
  onFeedback,
  onSelectOptions,
}) => {
  const workshopData = useMemo<WorkshopData>(() => ({
    purpose: formState.purpose,
    product: formState.product,
    participantsInfo: formState.participantsInfo,
    workshopType: formState.workshopType,
    flipchartAvailable: formState.flipchartAvailable,
    duration: formState.duration,
    participants: parseInt(formState.participants, 10) || 10,
    plan: workshopPlan?.map(step => ({ ...step, id: step.id })) || [],
    analysis: analysis || undefined,
    preparation: preparation || undefined,
    participantManagement: participantManagement || undefined,
    execution: execution || undefined,
    followUp: followUp || undefined,
  }), [
    formState.purpose,
    formState.product,
    formState.participantsInfo,
    formState.workshopType,
    formState.flipchartAvailable,
    formState.duration,
    formState.participants,
    workshopPlan,
    analysis,
    preparation,
    participantManagement,
    execution,
    followUp,
  ]);

  const totalParticipants = useMemo(
    () => parseInt(formState.participants, 10) || 10,
    [formState.participants]
  );

  if (processOptions && processOptions.length > 0) {
    return (
      <ProcessOptionsSelector
        options={processOptions}
        onSelect={onSelectOptions}
      />
    );
  }

  if (!workshopPlan || !analysis) {
    return null;
  }

  return (
    <WorkshopResults
      workshopPlan={workshopPlan}
      analysis={analysis}
      preparation={preparation}
      participantManagement={participantManagement}
      execution={execution}
      followUp={followUp}
      totalParticipants={totalParticipants}
      workshopData={workshopData}
      isSaved={isSaved}
      viewMode={viewMode}
      suggestingStepId={suggestingStepId}
      onUpdateStep={onUpdateStep}
      onSuggestAlternative={onSuggestAlternative}
      onViewModeChange={onViewModeChange}
      onSort={onSort}
      onPlanUpdate={onPlanUpdate}
      onConsult={onConsult}
      onFeedback={onFeedback}
    />
  );
};

export default WorkshopResultsContainer;

