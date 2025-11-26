/**
 * 워크숍 생성 상태 관리 Reducer
 */

import type {
    WorkshopStep,
    WorkshopAnalysis,
    WorkshopPreparation,
    ParticipantManagement,
    WorkshopExecution,
    WorkshopFollowUp,
    ProcessOption,
    WorkshopData
} from '../types';

export interface WorkshopState {
    form: {
        purpose: string;
        product: string;
        participantsInfo: string;
        workshopType: string;
        duration: number;
        participants: string;
        flipchartAvailable: boolean;
    };
    result: {
        plan: WorkshopStep[] | null;
        analysis: WorkshopAnalysis | null;
        preparation: WorkshopPreparation | null;
        participantManagement: ParticipantManagement | null;
        execution: WorkshopExecution | null;
        followUp: WorkshopFollowUp | null;
        processOptions: ProcessOption[] | null;
    };
    ui: {
        isLoading: boolean;
        isGeneratingOptions: boolean;
        loadingProgress: number;
        currentLoadingMessage: string;
        isSuggesting: boolean;
        suggestingStepId: string | null;
        error: string | null;
        isSaved: boolean;
        savedWorkshopId: string | null;
    };
}

export type WorkshopAction =
    | { type: 'SET_FORM_FIELD'; field: keyof WorkshopState['form']; value: string | number | boolean }
    | { type: 'SET_FORM'; form: WorkshopState['form'] }
    | { type: 'SET_PLAN'; plan: WorkshopStep[] | null }
    | { type: 'UPDATE_PLAN'; plan: WorkshopStep[] }
    | { type: 'SET_ANALYSIS'; analysis: WorkshopAnalysis | null }
    | { type: 'SET_PREPARATION'; preparation: WorkshopPreparation | null }
    | { type: 'SET_PARTICIPANT_MANAGEMENT'; participantManagement: ParticipantManagement | null }
    | { type: 'SET_EXECUTION'; execution: WorkshopExecution | null }
    | { type: 'SET_FOLLOW_UP'; followUp: WorkshopFollowUp | null }
    | { type: 'SET_PROCESS_OPTIONS'; options: ProcessOption[] | null }
    | { type: 'SET_LOADING'; isLoading: boolean }
    | { type: 'SET_GENERATING_OPTIONS'; isGeneratingOptions: boolean }
    | { type: 'SET_LOADING_PROGRESS'; progress: number; message: string }
    | { type: 'SET_SUGGESTING'; isSuggesting: boolean; stepId: string | null }
    | { type: 'SET_ERROR'; error: string | null }
    | { type: 'SET_SAVED'; isSaved: boolean; workshopId: string | null }
    | { type: 'RESET' };

import { DEFAULT_FORM_STATE } from '../config/constants';

export const initialState: WorkshopState = {
    form: { ...DEFAULT_FORM_STATE },
    result: {
        plan: null,
        analysis: null,
        preparation: null,
        participantManagement: null,
        execution: null,
        followUp: null,
        processOptions: null,
    },
    ui: {
        isLoading: false,
        isGeneratingOptions: false,
        loadingProgress: 0,
        currentLoadingMessage: '',
        isSuggesting: false,
        suggestingStepId: null,
        error: null,
        isSaved: false,
        savedWorkshopId: null,
    },
};

export function workshopReducer(state: WorkshopState, action: WorkshopAction): WorkshopState {
    switch (action.type) {
        case 'SET_FORM_FIELD':
            // 문자열 필드는 항상 문자열로 보장
            const fieldValue = action.value;
            const stringFields: (keyof WorkshopState['form'])[] = ['purpose', 'product', 'participantsInfo', 'workshopType', 'participants'];
            const normalizedValue = stringFields.includes(action.field) 
                ? (fieldValue === null || fieldValue === undefined ? '' : String(fieldValue))
                : fieldValue;
            
            return {
                ...state,
                form: {
                    ...state.form,
                    [action.field]: normalizedValue,
                },
            };

        case 'SET_FORM':
            return {
                ...state,
                form: action.form,
            };

        case 'SET_PLAN':
            return {
                ...state,
                result: {
                    ...state.result,
                    plan: action.plan,
                },
            };

        case 'UPDATE_PLAN':
            return {
                ...state,
                result: {
                    ...state.result,
                    plan: action.plan,
                },
            };

        case 'SET_ANALYSIS':
            return {
                ...state,
                result: {
                    ...state.result,
                    analysis: action.analysis,
                },
            };

        case 'SET_PREPARATION':
            return {
                ...state,
                result: {
                    ...state.result,
                    preparation: action.preparation,
                },
            };

        case 'SET_PARTICIPANT_MANAGEMENT':
            return {
                ...state,
                result: {
                    ...state.result,
                    participantManagement: action.participantManagement,
                },
            };

        case 'SET_EXECUTION':
            return {
                ...state,
                result: {
                    ...state.result,
                    execution: action.execution,
                },
            };

        case 'SET_FOLLOW_UP':
            return {
                ...state,
                result: {
                    ...state.result,
                    followUp: action.followUp,
                },
            };

        case 'SET_PROCESS_OPTIONS':
            return {
                ...state,
                result: {
                    ...state.result,
                    processOptions: action.options,
                },
            };

        case 'SET_LOADING':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isLoading: action.isLoading,
                    error: action.isLoading ? null : state.ui.error, // 로딩 시작 시 에러 초기화
                },
            };

        case 'SET_GENERATING_OPTIONS':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isGeneratingOptions: action.isGeneratingOptions,
                },
            };

        case 'SET_LOADING_PROGRESS':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    loadingProgress: action.progress,
                    currentLoadingMessage: action.message,
                },
            };

        case 'SET_SUGGESTING':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isSuggesting: action.isSuggesting,
                    suggestingStepId: action.stepId,
                },
            };

        case 'SET_ERROR':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    error: action.error,
                },
            };

        case 'SET_SAVED':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isSaved: action.isSaved,
                    savedWorkshopId: action.workshopId,
                },
            };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

