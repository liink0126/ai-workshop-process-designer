// 애플리케이션 상수 정의

export const WORKSHOP_TYPES = [
  'AI에게 추천받기',
  '팀 빌딩/소통',
  '아이디어/전략',
  '비전/목표 수립',
] as const;

export const WORKSHOP_STEP_TYPES = ['오프닝', '본론', '휴식', '클로징'] as const;

export const DIFFICULTY_LEVELS = ['쉬움', '보통', '어려움', '전문가 필요'] as const;

export const FACILITATOR_COMPETENCY_LEVELS = {
  BEGINNER: { min: 0, max: 24, label: '초급' },
  INTERMEDIATE: { min: 25, max: 49, label: '중급' },
  ADVANCED: { min: 50, max: 74, label: '고급' },
  EXPERT: { min: 75, max: 100, label: '전문가' },
} as const;

export const LOADING_MESSAGES = [
  "Liink의 전문 노하우를 분석 중입니다...",
  "최적의 퍼실리테이션 기법을 조합하고 있습니다...",
  "참여자 특성에 맞춰 활동을 조정하는 중...",
  "거의 다 됐습니다! 최종 계획을 생성하고 있어요.",
] as const;

export const METRICS_LABELS = [
  '주제 복잡성',
  '결과물 도출 난이도',
  '참여자 동기부여',
  '참여자 간 갈등 가능성',
  '의사결정 필요성',
] as const;

export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_HOURS = 24;
export const MIN_PARTICIPANTS = 1;
export const MAX_PARTICIPANTS = 100;

export const DEFAULT_FORM_STATE = {
  purpose: '',
  product: '',
  participantsInfo: '',
  workshopType: 'AI에게 추천받기' as const,
  flipchartAvailable: true,
  duration: 4,
  participants: '10',
} as const;

// 로딩 진행률 관련 상수
export const LOADING_PROGRESS = {
  INITIAL: 10,
  START: 20,
  PROCESSING: 30,
  NEAR_COMPLETE: 80,
  BEFORE_COMPLETE: 90,
  COMPLETE: 100,
  MAX_BEFORE_COMPLETE: 90,
} as const;

// 로딩 애니메이션 관련 상수
export const LOADING_INTERVALS = {
  PROGRESS_UPDATE: 800, // ms
  MESSAGE_UPDATE: 2500, // ms
  SCROLL_DELAY: 100, // ms
  COMPLETE_DELAY: 300, // ms
} as const;

// 진행률 증가량
export const PROGRESS_INCREMENT = 15;

// 워크숍 시간 옵션
export const WORKSHOP_DURATION_OPTIONS = {
  MAX_SINGLE_DAY: 8,
  TWO_DAYS: 16,
  THREE_DAYS: 24,
  MAX_HOURS: 24,
} as const;

// 참여자 수 제한
export const PARTICIPANT_LIMITS = {
  MIN: 1,
  MAX: 100,
} as const;

