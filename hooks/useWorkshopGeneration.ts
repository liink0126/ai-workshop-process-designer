/**
 * 워크숍 생성 커스텀 훅
 * useReducer를 사용하여 상태 관리를 최적화
 */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { generateWorkshopProcess, generate3PExample, generateAlternativeStep } from '../services/geminiService';
import { generateMultipleProcessOptions, finalizeProcessFromOptions } from '../services/processOptimizationService';
import { WorkshopStep, WorkshopData, ProcessOption } from '../types';
import { saveWorkshop } from '../lib/firebase';
import { validateWorkshopForm } from '../utils/validation';
import { getErrorMessage } from '../utils/errorHandler';
import { LOADING_MESSAGES, DEFAULT_FORM_STATE, LOADING_PROGRESS, LOADING_INTERVALS, PROGRESS_INCREMENT } from '../config/constants';
import { User } from 'firebase/auth';
import { workshopReducer, initialState, type WorkshopState } from './workshopReducer';

interface UseWorkshopGenerationProps {
  user: User | null;
  templateData?: WorkshopData | null;
  onTemplateUsed?: () => void;
}

export const useWorkshopGeneration = ({ user, templateData, onTemplateUsed }: UseWorkshopGenerationProps) => {
  const [state, dispatch] = useReducer(workshopReducer, initialState);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 상태 접근을 위한 헬퍼
  const { form: formState, result, ui } = state;

  const handleInputChange = useCallback((field: keyof WorkshopState['form'], value: string | number | boolean) => {
    dispatch({ type: 'SET_FORM_FIELD', field, value });
    if (ui.error) {
      dispatch({ type: 'SET_ERROR', error: null });
    }
  }, [ui.error]);

  const handleGenerateWorkshop = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', error: null });

    const participantsAsNumber = parseInt(formState.participants, 10) || 1;
    const validation = validateWorkshopForm({
      ...formState,
      participants: formState.participants,
    });

    if (!validation.isValid) {
      dispatch({ type: 'SET_ERROR', error: validation.error || '입력 정보를 확인해 주세요.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.START, message: LOADING_MESSAGES[0] });
    dispatch({ type: 'SET_PLAN', plan: null });
    dispatch({ type: 'SET_ANALYSIS', analysis: null });
    dispatch({ type: 'SET_PREPARATION', preparation: null });
    dispatch({ type: 'SET_PARTICIPANT_MANAGEMENT', participantManagement: null });
    dispatch({ type: 'SET_EXECUTION', execution: null });
    dispatch({ type: 'SET_FOLLOW_UP', followUp: null });
    dispatch({ type: 'SET_SAVED', isSaved: false, workshopId: null });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.PROCESSING, message: LOADING_MESSAGES[1] });
      const result = await generateWorkshopProcess(
        formState.purpose.trim(), 
        formState.product.trim(), 
        formState.participantsInfo.trim(), 
        formState.duration, 
        participantsAsNumber, 
        formState.workshopType, 
        formState.flipchartAvailable
      );
      
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.NEAR_COMPLETE, message: LOADING_MESSAGES[2] });
      
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
      
      dispatch({ type: 'SET_PLAN', plan: planWithIds });
      dispatch({ type: 'SET_ANALYSIS', analysis: result.analysis });
      dispatch({ type: 'SET_PREPARATION', preparation: result.preparation });
      if (result.participantManagement) {
        dispatch({ type: 'SET_PARTICIPANT_MANAGEMENT', participantManagement: result.participantManagement });
      }
      if (result.execution) {
        dispatch({ type: 'SET_EXECUTION', execution: result.execution });
      }
      if (result.followUp) {
        const followUpWithIds = {
          ...result.followUp,
          actionPlans: result.followUp.actionPlans.map(plan => ({
            ...plan,
            id: plan.id || crypto.randomUUID()
          }))
        };
        dispatch({ type: 'SET_FOLLOW_UP', followUp: followUpWithIds });
      }
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.BEFORE_COMPLETE, message: LOADING_MESSAGES[3] });

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
          dispatch({ type: 'SET_SAVED', isSaved: true, workshopId });
        } catch (saveError) {
          console.warn('워크숍 저장 실패:', saveError);
        }
      }
      
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.COMPLETE, message: LOADING_MESSAGES[3] });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }, LOADING_INTERVALS.COMPLETE_DELAY);

    } catch (err) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      const errorMessage = getErrorMessage(err);
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      console.error('워크숍 생성 오류:', err);
    }
  }, [formState, user]);

  const handleUpdateStep = useCallback((updatedStep: WorkshopStep) => {
    if (!result.plan) return;
    const updatedPlan = result.plan.map(step => step.id === updatedStep.id ? updatedStep : step);
    dispatch({ type: 'UPDATE_PLAN', plan: updatedPlan });
  }, [result.plan]);

  const handleSuggestAlternative = useCallback(async (stepId: string) => {
    if (!result.plan) return;
    dispatch({ type: 'SET_SUGGESTING', isSuggesting: true, stepId });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const stepToReplace = result.plan.find(s => s.id === stepId);
      if (!stepToReplace) throw new Error("대체할 단계를 찾을 수 없습니다.");

      const alternativeStepData = await generateAlternativeStep(
        stepToReplace,
        result.plan,
        { purpose: formState.purpose, product: formState.product, participantsInfo: formState.participantsInfo }
      );

      const updatedPlan = result.plan.map(step => 
        step.id === stepId 
        ? { ...alternativeStepData, id: stepId, duration: stepToReplace.duration }
        : step
      );
      dispatch({ type: 'UPDATE_PLAN', plan: updatedPlan });

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      dispatch({ type: 'SET_ERROR', error: `대체 모듈 제안에 실패했습니다: ${errorMessage}` });
      console.error("대체 단계 생성 오류:", err);
    } finally {
      dispatch({ type: 'SET_SUGGESTING', isSuggesting: false, stepId: null });
    }
  }, [result.plan, formState]);

  const handleAiSuggestion = useCallback(async () => {
    if (formState.workshopType === 'AI에게 추천받기') {
      dispatch({ type: 'SET_ERROR', error: '먼저 워크숍 유형을 선택해주세요. AI가 유형에 맞는 예시를 추천해 드립니다.' });
      return;
    }
    dispatch({ type: 'SET_SUGGESTING', isSuggesting: true, stepId: null });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const example = await generate3PExample(formState.workshopType);
      dispatch({ 
        type: 'SET_FORM', 
        form: {
          ...formState,
          purpose: example.purpose,
          product: example.product,
          participantsInfo: example.participantsInfo,
        }
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      dispatch({ type: 'SET_ERROR', error: `AI 추천을 받아오는 데 실패했습니다: ${errorMessage}` });
      console.error('AI 추천 오류:', err);
    } finally {
      dispatch({ type: 'SET_SUGGESTING', isSuggesting: false, stepId: null });
    }
  }, [formState]);

  const handleGenerateMultiple = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', error: null });
    const participantsAsNumber = parseInt(formState.participants, 10) || 1;
    const validation = validateWorkshopForm({
      ...formState,
      participants: formState.participants,
    });

    if (!validation.isValid) {
      dispatch({ type: 'SET_ERROR', error: validation.error || '입력 정보를 확인해 주세요.' });
      return;
    }

    dispatch({ type: 'SET_GENERATING_OPTIONS', isGeneratingOptions: true });
    dispatch({ type: 'SET_ERROR', error: null });

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
      dispatch({ type: 'SET_PROCESS_OPTIONS', options });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      dispatch({ type: 'SET_ERROR', error: `여러 옵션 생성에 실패했습니다: ${errorMessage}` });
      console.error('여러 옵션 생성 오류:', err);
    } finally {
      dispatch({ type: 'SET_GENERATING_OPTIONS', isGeneratingOptions: false });
    }
  }, [formState]);

  const handleSelectOptions = useCallback(async (selectedOptions: ProcessOption[]) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.PROCESSING, message: LOADING_MESSAGES[1] });

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
      
      dispatch({ type: 'SET_PLAN', plan: planWithIds });
      dispatch({ type: 'SET_ANALYSIS', analysis: result.analysis });
      dispatch({ type: 'SET_PREPARATION', preparation: result.preparation });
      if (result.participantManagement) {
        dispatch({ type: 'SET_PARTICIPANT_MANAGEMENT', participantManagement: result.participantManagement });
      }
      if (result.execution) {
        dispatch({ type: 'SET_EXECUTION', execution: result.execution });
      }
      if (result.followUp) {
        const followUpWithIds = {
          ...result.followUp,
          actionPlans: result.followUp.actionPlans.map(plan => ({
            ...plan,
            id: plan.id || crypto.randomUUID()
          }))
        };
        dispatch({ type: 'SET_FOLLOW_UP', followUp: followUpWithIds });
      }

      dispatch({ type: 'SET_PROCESS_OPTIONS', options: null });
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.COMPLETE, message: LOADING_MESSAGES[3] });

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
          dispatch({ type: 'SET_SAVED', isSaved: true, workshopId });
        } catch (saveError) {
          console.warn('워크숍 저장 실패:', saveError);
        }
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }, LOADING_INTERVALS.COMPLETE_DELAY);

    } catch (err) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      const errorMessage = getErrorMessage(err);
      dispatch({ type: 'SET_ERROR', error: `최종 프로세스 생성에 실패했습니다: ${errorMessage}` });
      console.error('최종 프로세스 생성 오류:', err);
    }
  }, [formState, user]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setFormState = useCallback((form: WorkshopState['form']) => {
    dispatch({ type: 'SET_FORM', form });
  }, []);

  const setWorkshopPlan = useCallback((plan: WorkshopStep[] | null) => {
    dispatch({ type: 'SET_PLAN', plan });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  // 템플릿 데이터 처리
  useEffect(() => {
    if (templateData) {
      dispatch({ 
        type: 'SET_FORM', 
        form: {
          purpose: templateData.purpose || '',
          product: templateData.product || '',
          participantsInfo: templateData.participantsInfo || '',
          workshopType: templateData.workshopType || 'AI에게 추천받기',
          duration: templateData.duration || 4,
          participants: String(templateData.participants || 10),
          flipchartAvailable: templateData.flipchartAvailable || false,
        }
      });

      if (templateData.plan && templateData.plan.length > 0) {
        const planWithIds = templateData.plan.map(step => ({ 
          ...step, 
          id: step.id || crypto.randomUUID() 
        }));
        dispatch({ type: 'SET_PLAN', plan: planWithIds });
      }

      if (templateData.analysis) {
        dispatch({ type: 'SET_ANALYSIS', analysis: templateData.analysis });
      }

      if (templateData.preparation) {
        dispatch({ type: 'SET_PREPARATION', preparation: templateData.preparation });
      }

      if (templateData.participantManagement) {
        dispatch({ type: 'SET_PARTICIPANT_MANAGEMENT', participantManagement: templateData.participantManagement });
      }

      if (templateData.execution) {
        dispatch({ type: 'SET_EXECUTION', execution: templateData.execution });
      }

      if (templateData.followUp) {
        dispatch({ type: 'SET_FOLLOW_UP', followUp: templateData.followUp });
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
    if (ui.isLoading) {
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: LOADING_PROGRESS.INITIAL, message: LOADING_MESSAGES[3] });
      
      const progressInterval = setInterval(() => {
        const currentProgress = state.ui.loadingProgress;
        if (currentProgress >= LOADING_PROGRESS.MAX_BEFORE_COMPLETE) {
          return;
        }
        const newProgress = currentProgress + Math.random() * PROGRESS_INCREMENT;
        dispatch({ type: 'SET_LOADING_PROGRESS', progress: newProgress, message: state.ui.currentLoadingMessage });
      }, LOADING_INTERVALS.PROGRESS_UPDATE);
      
      return () => {
        clearInterval(progressInterval);
      };
    } else {
      dispatch({ type: 'SET_LOADING_PROGRESS', progress: 0, message: '' });
    }
  }, [ui.isLoading, state.ui.loadingProgress, state.ui.currentLoadingMessage]);

  return {
    formState,
    setFormState,
    workshopPlan: result.plan,
    setWorkshopPlan,
    analysis: result.analysis,
    preparation: result.preparation,
    participantManagement: result.participantManagement,
    execution: result.execution,
    followUp: result.followUp,
    processOptions: result.processOptions,
    isLoading: ui.isLoading,
    isGeneratingOptions: ui.isGeneratingOptions,
    loadingProgress: ui.loadingProgress,
    currentLoadingMessage: ui.currentLoadingMessage,
    isSuggesting: ui.isSuggesting,
    suggestingStepId: ui.suggestingStepId,
    error: ui.error,
    isSaved: ui.isSaved,
    savedWorkshopId: ui.savedWorkshopId,
    resultsRef,
    handleInputChange,
    handleGenerate: handleGenerateWorkshop,
    handleGenerateMultiple,
    handleSelectOptions,
    handleUpdateStep,
    handleSuggestAlternative,
    handleAiSuggestion,
    handleReset,
    setError,
  };
};
