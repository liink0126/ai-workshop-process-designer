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

export interface WorkshopGenerationResult {
  plan: Omit<WorkshopStep, 'id'>[];
  analysis: WorkshopAnalysis;
  preparation: WorkshopPreparation;
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