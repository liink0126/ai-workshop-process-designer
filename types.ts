export type WorkshopStepType = '오프닝' | '본론' | '휴식' | '클로징';

export interface WorkshopStep {
  id: string;
  type: WorkshopStepType;
  title: string;
  duration: number;
  description: string;
  techniques: string;
  techniquesRationale: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  registeredDeviceId: string | null;
  credits?: number;
}

export interface WorkshopAnalysis {
  difficulty: '쉬움' | '보통' | '어려움' | '전문가 필요';
  difficultyReason: string;
  metrics: { label: string; value: number }[]; // value from 1 to 5
  facilitatorCompetency: number; // value from 0 to 100
  keySuccessFactors: { title: string; description: string }[];
}

export interface WorkshopPreparation {
  materials: string[]; // 필요한 준비물 목록
  roomSetup: string; // 공간 배치 설명
  preWorkshopTasks: string[]; // 사전 준비 작업 체크리스트
  participantPreBrief?: string; // 참여자 사전 안내 내용 (선택)
}

export interface ParticipantManagement {
  groupStrategy: {
    recommendedGroups: number; // 추천 그룹 수
    groupSize: number; // 그룹당 인원
    strategy: string; // 그룹 구성 전략 설명
    groupingOptions: string[]; // 그룹 구성 옵션 (랜덤, 부서별, 역할별 등)
  };
  roleAssignment?: {
    roles: string[]; // 역할 목록
    assignmentGuide: string; // 역할 분담 가이드
  };
  preWorkshopSurvey?: {
    questions: string[]; // 사전 조사 질문 목록
    purpose: string; // 조사 목적
  };
}

export interface WorkshopExecution {
  timerEnabled: boolean; // 타이머 사용 여부
  timeAdjustmentGuide?: {
    ifTimeShort: string[]; // 시간이 부족할 때 대응 전략
    ifTimeExtra: string[]; // 시간이 남을 때 활용 전략
  };
}

export interface ActionPlanItem {
  id: string;
  task: string; // 실행 과제
  owner: string; // 담당자
  dueDate: string; // 마감일
  status: 'pending' | 'in-progress' | 'completed'; // 상태
  notes?: string; // 메모
}

export interface WorkshopFollowUp {
  actionPlans: ActionPlanItem[]; // 액션 플랜 목록
  feedbackSurvey?: {
    questions: string[]; // 피드백 설문 질문
    purpose: string; // 설문 목적
  };
  effectivenessMetrics?: {
    questions: string[]; // 효과 측정 질문
    measurementGuide: string; // 측정 가이드
  };
}

export interface WorkshopReport {
  title: string;
  summary: string;
  participants: number;
  duration: number;
  keyOutcomes: string[];
  actionPlans: ActionPlanItem[];
  feedbackSummary?: string;
  nextSteps?: string[];
}

export interface WorkshopFeedback {
  workshopId: string;
  userId: string;
  rating: number; // 1-5점
  strengths: string[]; // 강점
  improvements: string[]; // 개선점
  suggestions: string; // 제안사항
  executedAsPlanned: boolean; // 계획대로 실행되었는지
  actualDuration?: number; // 실제 소요 시간
  createdAt: Date;
}

export interface ProcessOption {
  id: string;
  plan: Omit<WorkshopStep, 'id'>[];
  analysis: WorkshopAnalysis;
  preparation: WorkshopPreparation;
  participantManagement?: ParticipantManagement;
  execution?: WorkshopExecution;
  followUp?: WorkshopFollowUp;
  summary: string; // 이 옵션의 특징 요약
  pros: string[]; // 장점
  cons: string[]; // 단점
}

export type SituationType = '참여도 저하' | '시간 부족' | '시간 여유' | '갈등 발생' | '기술 장애' | '참여자 이탈' | '주제 이탈' | '기타';

export interface RealTimeSituation {
  id: string;
  timestamp: Date;
  type: SituationType;
  description: string;
  currentStepId?: string; // 현재 진행 중인 단계 ID
  severity: 'low' | 'medium' | 'high'; // 심각도
}

export interface SituationResponse {
  analysis: string; // 상황 분석
  recommendedActions: string[]; // 권장 조치 사항
  alternativeSteps?: Omit<WorkshopStep, 'id'>[]; // 대안 단계 제안
  processAdjustments?: {
    skipSteps?: string[]; // 건너뛸 단계 ID
    extendSteps?: { stepId: string; additionalMinutes: number }[]; // 연장할 단계
    modifySteps?: { stepId: string; modifications: string }[]; // 수정할 단계
  };
  emergencyGuide?: string; // 긴급 상황 대응 가이드
}

export interface WorkshopGenerationResult {
  plan: Omit<WorkshopStep, 'id'>[];
  analysis: WorkshopAnalysis;
  preparation: WorkshopPreparation;
  participantManagement?: ParticipantManagement;
  execution?: WorkshopExecution;
  followUp?: WorkshopFollowUp;
}

export interface WorkshopData {
  purpose: string;
  product: string;
  participantsInfo: string;
  workshopType: string;
  flipchartAvailable: boolean;
  duration: number;
  participants: number;
  plan: Omit<WorkshopStep, 'id'>[];
  analysis: WorkshopAnalysis;
  preparation?: WorkshopPreparation; // 선택적 필드 (하위 호환성)
  participantManagement?: ParticipantManagement;
  execution?: WorkshopExecution;
  followUp?: WorkshopFollowUp;
}

export interface WorkshopDocument extends Omit<WorkshopData, 'plan'> {
  id: string;
  userId: string;
  userEmail: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  plan: WorkshopStep[];
  problem?: string; // for backward compatibility
  analysis: WorkshopAnalysis;
}

export interface WorkshopTemplate {
  id: string;
  name: string;
  workshopData: WorkshopData;
  userId: string;
  userEmail: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}