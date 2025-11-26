/**
 * 워크숍 폼 컨테이너 컴포넌트
 * 폼 관련 로직을 분리하여 재사용성 향상
 */

import React, { useCallback, useMemo } from 'react';
import WorkshopForm from './WorkshopForm';
import LoadingProgress from './LoadingProgress';
import ErrorMessage from './ErrorMessage';

interface WorkshopFormContainerProps {
  formState: {
    purpose: string;
    product: string;
    participantsInfo: string;
    workshopType: string;
    duration: number;
    participants: string;
    flipchartAvailable: boolean;
  };
  isLoading: boolean;
  isGeneratingOptions: boolean;
  isSuggesting: boolean;
  currentLoadingMessage: string;
  loadingProgress: number;
  error: string | null;
  onInputChange: (field: keyof WorkshopFormContainerProps['formState'], value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUseExample: () => void;
  onAiSuggestion: () => void;
  onReset: () => void;
  onGenerateMultiple: () => void;
  onErrorClose: () => void;
}

const WorkshopFormContainer: React.FC<WorkshopFormContainerProps> = ({
  formState,
  isLoading,
  isGeneratingOptions,
  isSuggesting,
  currentLoadingMessage,
  loadingProgress,
  error,
  onInputChange,
  onSubmit,
  onUseExample,
  onAiSuggestion,
  onReset,
  onGenerateMultiple,
  onErrorClose,
}) => {
  const isFormLoading = useMemo(
    () => isLoading || isGeneratingOptions,
    [isLoading, isGeneratingOptions]
  );

  return (
    <>
      <WorkshopForm
        formState={formState}
        isLoading={isFormLoading}
        isSuggesting={isSuggesting}
        currentLoadingMessage={currentLoadingMessage}
        loadingProgress={loadingProgress}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onUseExample={onUseExample}
        onAiSuggestion={onAiSuggestion}
        onReset={onReset}
        onGenerateMultiple={onGenerateMultiple}
      />
      {isLoading && (
        <LoadingProgress 
          message={currentLoadingMessage}
          progress={loadingProgress}
        />
      )}
      {error && (
        <ErrorMessage 
          message={error}
          onClose={onErrorClose}
          type="error"
        />
      )}
    </>
  );
};

export default WorkshopFormContainer;

