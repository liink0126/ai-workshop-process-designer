import { useState, useCallback, useRef, useEffect } from 'react';
import { generateWorkshopProcess, generate3PExample, generateAlternativeStep } from '../services/geminiService';
import { WorkshopStep, WorkshopAnalysis, WorkshopData, WorkshopPreparation, ParticipantManagement, WorkshopExecution, WorkshopFollowUp } from '../types';
import { saveWorkshop } from '../lib/firebase';
import { validateWorkshopForm } from '../utils/validation';
import { getErrorMessage } from '../utils/errorHandler';
import { LOADING_MESSAGES, DEFAULT_FORM_STATE, LOADING_PROGRESS, LOADING_INTERVALS, PROGRESS_INCREMENT } from '../config/constants';
import { User } from 'firebase/auth';

interface UseWorkshopGenerationProps {
  user: User | null;
  templateData?: WorkshopData | null;
  onTemplateUsed?: () => void;
}

export const useWorkshopGeneration = ({ user, templateData, onTemplateUsed }: UseWorkshopGenerationProps) => {
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [workshopPlan, setWorkshopPlan] = useState<WorkshopStep[] | null>(null);
  const [analysis, setAnalysis] = useState<WorkshopAnalysis | null>(null);
  const [preparation, setPreparation] = useState<WorkshopPreparation | null>(null);
  const [participantManagement, setParticipantManagement] = useState<ParticipantManagement | null>(null);
  const [execution, setExecution] = useState<WorkshopExecution | null>(null);
  const [followUp, setFollowUp] = useState<WorkshopFollowUp | null>(null);
  const [processOptions, setProcessOptions] = useState<ProcessOption[] | null>(null);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestingStepId, setSuggestingStepId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((field: keyof typeof DEFAULT_FORM_STATE, value: string | number | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const participantsAsNumber = parseInt(formState.participants, 10) || 1;
    const validation = validateWorkshopForm({
      ...formState,
      participants: formState.participants,
    });

    if (!validation.isValid) {
      setError(validation.error || '입력 정보를 확인해 주세요.');
      return;
    }

    setIsLoading(true);
    setLoadingProgress(LOADING_PROGRESS.START);
    setWorkshopPlan(null);
    setAnalysis(null);
    setPreparation(null);
    setParticipantManagement(null);
    setExecution(null);
    setFollowUp(null);
    setIsSaved(false);
    setError(null);

    try {
      setLoadingProgress(LOADING_PROGRESS.PROCESSING);
      const result = await generateWorkshopProcess(
        formState.purpose.trim(), 
        formState.product.trim(), 
        formState.participantsInfo.trim(), 
        formState.duration, 
        participantsAsNumber, 
        formState.workshopType, 
        formState.flipchartAvailable
      );
      
      setLoadingProgress(LOADING_PROGRESS.NEAR_COMPLETE);
      
      if (!result.plan || result.plan.length === 0) {
        throw new Error('워크숍 계획이 생성되지 않았습니다. 입력 정보를 확인하고 다시 시도해 주세요.');
      }
      
      if (!result.analysis) {
        throw new Error('워크숍 분석 정보가 생성되지 않았습니다. 다시 시도해 주세요.');
      }

      if (!result.preparation) {
        throw new Error('워크숍 준비 정보가 생성되지 않았습니다. 다시 시도해 주세요.');
      }

      const planWithIds = result.plan.map(step => ({ ...step, id: crypto.randomUUID() }));
      
      setWorkshopPlan(planWithIds);
      setAnalysis(result.analysis);
      setPreparation(result.preparation);
      if (result.participantManagement) {
        setParticipantManagement(result.participantManagement);
      }
      if (result.execution) {
        setExecution(result.execution);
      }
      if (result.followUp) {
        // ActionPlan에 id 추가
        const followUpWithIds = {
          ...result.followUp,
          actionPlans: result.followUp.actionPlans.map(plan => ({
            ...plan,
            id: plan.id || crypto.randomUUID()
          }))
        };
        setFollowUp(followUpWithIds);
      }
      setLoadingProgress(LOADING_PROGRESS.BEFORE_COMPLETE);

      if (user) {
        try {
          const workshopId = await saveWorkshop({ 
            ...formState,
            participants: participantsAsNumber, 
            plan: result.plan,
            analysis: result.analysis,
            preparation: result.preparation,
            participantManagement: result.participantManagement,
            execution: result.execution,
            followUp: result.followUp,
          });
          setIsSaved(true);
          setSavedWorkshopId(workshopId);
        } catch (saveError) {
          console.warn('워크숍 저장 실패:', saveError);
        }
      }
      
      setLoadingProgress(LOADING_PROGRESS.COMPLETE);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsLoading(false);
      }, LOADING_INTERVALS.COMPLETE_DELAY);

    } catch (err) {
      setIsLoading(false);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('워크숍 생성 오류:', err);
    }
  }, [formState, user]);

  const handleUpdateStep = useCallback((updatedStep: WorkshopStep) => {
    setWorkshopPlan(prevPlan => 
      prevPlan ? prevPlan.map(step => step.id === updatedStep.id ? updatedStep : step) : null
    );
  }, []);

  const handleSuggestAlternative = useCallback(async (stepId: string) => {
    if (!workshopPlan) return;
    setSuggestingStepId(stepId);
    setError(null);
    try {
      const stepToReplace = workshopPlan.find(s => s.id === stepId);
      if (!stepToReplace) throw new Error("대체할 단계를 찾을 수 없습니다.");

      const alternativeStepData = await generateAlternativeStep(
        stepToReplace,
        workshopPlan,
        { purpose: formState.purpose, product: formState.product, participantsInfo: formState.participantsInfo }
      );

      setWorkshopPlan(prevPlan => {
        if (!prevPlan) return null;
        return prevPlan.map(step => 
          step.id === stepId 
          ? { ...alternativeStepData, id: stepId, duration: stepToReplace.duration }
          : step
        );
      });

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`대체 모듈 제안에 실패했습니다: ${errorMessage}`);
      console.error("대체 단계 생성 오류:", err);
    } finally {
      setSuggestingStepId(null);
    }
  }, [workshopPlan, formState]);

  const handleAiSuggestion = useCallback(async () => {
    if (formState.workshopType === 'AI에게 추천받기') {
      setError('먼저 워크숍 유형을 선택해주세요. AI가 유형에 맞는 예시를 추천해 드립니다.');
      return;
    }
    setIsSuggesting(true);
    setError(null);
    try {
      const example = await generate3PExample(formState.workshopType);
      setFormState(prev => ({
        ...prev,
        purpose: example.purpose,
        product: example.product,
        participantsInfo: example.participantsInfo,
      }));
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`AI 추천을 받아오는 데 실패했습니다: ${errorMessage}`);
      console.error('AI 추천 오류:', err);
    } finally {
      setIsSuggesting(false);
    }
  }, [formState.workshopType]);

  const handleGenerateMultiple = useCallback(async () => {
    setError(null);
    const participantsAsNumber = parseInt(formState.participants, 10) || 1;
    const validation = validateWorkshopForm({
      ...formState,
      participants: formState.participants,
    });

    if (!validation.isValid) {
      setError(validation.error || '입력 정보를 확인해 주세요.');
      return;
    }

    setIsGeneratingOptions(true);
    setError(null);

    try {
      const options = await generateMultipleProcessOptions(
        formState.purpose.trim(),
        formState.product.trim(),
        formState.participantsInfo.trim(),
        formState.duration,
        participantsAsNumber,
        formState.workshopType,
        formState.flipchartAvailable,
        3
      );
      setProcessOptions(options);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`여러 옵션 생성에 실패했습니다: ${errorMessage}`);
      console.error('여러 옵션 생성 오류:', err);
    } finally {
      setIsGeneratingOptions(false);
    }
  }, [formState]);

  const handleSelectOptions = useCallback(async (selectedOptions: ProcessOption[]) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(LOADING_PROGRESS.PROCESSING);

    try {
      const workshopData: WorkshopData = {
        purpose: formState.purpose,
        product: formState.product,
        participantsInfo: formState.participantsInfo,
        workshopType: formState.workshopType,
        flipchartAvailable: formState.flipchartAvailable,
        duration: formState.duration,
        participants: parseInt(formState.participants, 10) || 10,
        plan: [],
        analysis: selectedOptions[0].analysis,
        preparation: selectedOptions[0].preparation,
      };

      const result = await finalizeProcessFromOptions(selectedOptions, workshopData);

      const planWithIds = result.plan.map(step => ({ ...step, id: crypto.randomUUID() }));
      
      setWorkshopPlan(planWithIds);
      setAnalysis(result.analysis);
      setPreparation(result.preparation);
      if (result.participantManagement) {
        setParticipantManagement(result.participantManagement);
      }
      if (result.execution) {
        setExecution(result.execution);
      }
      if (result.followUp) {
        const followUpWithIds = {
          ...result.followUp,
          actionPlans: result.followUp.actionPlans.map(plan => ({
            ...plan,
            id: plan.id || crypto.randomUUID()
          }))
        };
        setFollowUp(followUpWithIds);
      }

      setProcessOptions(null);
      setLoadingProgress(LOADING_PROGRESS.COMPLETE);

      if (user) {
        try {
          const workshopId = await saveWorkshop({
            ...formState,
            participants: parseInt(formState.participants, 10) || 10,
            plan: result.plan,
            analysis: result.analysis,
            preparation: result.preparation,
            participantManagement: result.participantManagement,
            execution: result.execution,
            followUp: result.followUp,
          });
          setIsSaved(true);
          setSavedWorkshopId(workshopId);
        } catch (saveError) {
          console.warn('워크숍 저장 실패:', saveError);
        }
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsLoading(false);
      }, LOADING_INTERVALS.COMPLETE_DELAY);

    } catch (err) {
      setIsLoading(false);
      const errorMessage = getErrorMessage(err);
      setError(`최종 프로세스 생성에 실패했습니다: ${errorMessage}`);
      console.error('최종 프로세스 생성 오류:', err);
    }
  }, [formState, user]);

  const handleReset = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE);
    setError(null);
    setWorkshopPlan(null);
    setAnalysis(null);
    setPreparation(null);
    setParticipantManagement(null);
    setExecution(null);
    setFollowUp(null);
    setProcessOptions(null);
    setSavedWorkshopId(null);
    setIsSaved(false);
  }, []);

  // 템플릿 데이터 처리
  useEffect(() => {
    if (templateData) {
      setFormState({
        purpose: templateData.purpose || '',
        product: templateData.product || '',
        participantsInfo: templateData.participantsInfo || '',
        workshopType: templateData.workshopType || 'AI에게 추천받기',
        duration: templateData.duration || 4,
        participants: String(templateData.participants || 10),
        flipchartAvailable: templateData.flipchartAvailable || false,
      });

      if (templateData.plan && templateData.plan.length > 0) {
        const planWithIds = templateData.plan.map(step => ({ 
          ...step, 
          id: step.id || crypto.randomUUID() 
        }));
        setWorkshopPlan(planWithIds);
      }

      if (templateData.analysis) {
        setAnalysis(templateData.analysis);
      }

      if (templateData.preparation) {
        setPreparation(templateData.preparation);
      }

      if (templateData.participantManagement) {
        setParticipantManagement(templateData.participantManagement);
      }

      if (templateData.execution) {
        setExecution(templateData.execution);
      }

      if (templateData.followUp) {
        setFollowUp(templateData.followUp);
      }

      if (onTemplateUsed) {
        onTemplateUsed();
      }

      setTimeout(() => {
        if (templateData.plan && templateData.plan.length > 0) {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, LOADING_INTERVALS.SCROLL_DELAY);
    }
  }, [templateData, onTemplateUsed]);

  // 로딩 메시지 및 진행률 처리
  useEffect(() => {
    if (isLoading) {
      setCurrentLoadingMessage("거의 다 됐습니다! 최종 계획을 생성하고 있어요.");
      setLoadingProgress(LOADING_PROGRESS.INITIAL);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= LOADING_PROGRESS.MAX_BEFORE_COMPLETE) return prev;
          return prev + Math.random() * PROGRESS_INCREMENT;
        });
      }, LOADING_INTERVALS.PROGRESS_UPDATE);
      
      return () => {
        clearInterval(progressInterval);
      };
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  return {
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
  };
};

