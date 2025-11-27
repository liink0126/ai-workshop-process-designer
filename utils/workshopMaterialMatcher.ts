/**
 * 워크숍 프로세스 단계와 준비물/체크리스트를 매칭하는 유틸리티
 * 실제 워크숍 문서 패턴을 기반으로 설계
 */

import { WorkshopStep, WorkshopPreparation } from '../types';

/**
 * 단계 유형별 기본 준비물 매핑
 */
const STEP_TYPE_MATERIALS: Record<string, string[]> = {
  '오프닝': [
    '신호등카드 (참여자 수만큼)',
    'Ground Rule 차트',
    'Parking Board',
    '이름표 (참여자 수만큼)',
  ],
  '본론': [
    '포스트잇 (다양한 색상)',
    '사인펜 (참여자 수만큼)',
    '마커펜 (검정, 컬러)',
    '이젤패드 또는 차트지',
  ],
  '클로징': [
    '신호등카드',
    '피드백 양식',
    '액션 플랜 양식',
  ],
  '휴식': [],
};

/**
 * 기법(techniques)별 추가 준비물 매핑
 */
const TECHNIQUE_MATERIALS: Record<string, string[]> = {
  'Icebreaking': ['감정카드', '이미지카드', '크레파스 (12색)'],
  'Brainstorming': ['포스트잇 (다양한 색상)', '마커펜', '차트지'],
  'Gallery Walk': ['롤지 (2m 이상)', '스티키월', 'A6 색지'],
  'Multi-voting': ['스티커 (참여자 수만큼)', '투표용 차트'],
  'Affinity Diagram': ['포스트잇 (다양한 색상)', '분류용 차트'],
  'SWOT': ['SWOT 차트', '포스트잇'],
  'Stakeholder Analysis': ['이해관계자 맵', '롤지', 'A6 색카드'],
  'Mission Statement': ['롤지', '마커펜', '차트지'],
  'Vision Setting': ['롤지 (2.5m)', '마커펜', '포스트잇'],
  'Action Planning': ['액션 플랜 양식', '포스트잇', '마커펜'],
  'Presentation': ['프로젝터', '화이트보드', '발표용 차트'],
  'Group Discussion': ['이젤패드', '마커펜', '사인펜'],
  'Silent Writing': ['A4 용지', '사인펜'],
  'Check-in': ['신호등카드'],
  'Traffic Light Card': ['신호등카드 (참여자 수만큼)'],
  'PP&E': ['신호등카드', '피드백 양식'],
  'Spot Activity': ['활동용 도구 (단계별 상이)'],
};

/**
 * 설명(description)에서 추출할 수 있는 특정 준비물 키워드 매핑
 */
const DESCRIPTION_KEYWORDS: Record<string, string[]> = {
  '롤지': ['롤지 (2m)', '롤지 (2.5m)', '롤지'],
  'sticky wall': ['스티키월', 'sticky wall'],
  '이젤패드': ['이젤패드', '회의용 이젤스탠드 & 패드'],
  'A6': ['A6 색지', 'A6 색카드'],
  'A4': ['A4 용지'],
  '프로젝터': ['프로젝터', '빔프로젝터'],
  '플립차트': ['플립차트', '플립차트 2대'],
  '크레파스': ['크레파스 (12색)'],
  '감정카드': ['감정카드', 'emotion card'],
  '이미지카드': ['이미지카드'],
  '밧줄': ['밧줄 (밧줄게임용)'],
  '신호등카드': ['신호등카드 (참여자 수만큼)'],
};

/**
 * 워크숍 단계에서 필요한 준비물을 추출
 */
export function extractMaterialsFromStep(
  step: WorkshopStep,
  participantCount: number
): string[] {
  const materials: Set<string> = new Set();

  // 1. 단계 유형별 기본 준비물
  const typeMaterials = STEP_TYPE_MATERIALS[step.type] || [];
  typeMaterials.forEach(m => materials.add(m));

  // 2. 기법별 추가 준비물
  const techniques = step.techniques.split(',').map(t => t.trim());
  techniques.forEach(technique => {
    const techniqueMaterials = TECHNIQUE_MATERIALS[technique] || [];
    techniqueMaterials.forEach(m => materials.add(m));
  });

  // 3. 설명에서 키워드 기반 추출
  const description = step.description.toLowerCase();
  Object.entries(DESCRIPTION_KEYWORDS).forEach(([keyword, materialList]) => {
    if (description.includes(keyword.toLowerCase())) {
      materialList.forEach(m => materials.add(m));
    }
  });

  // 4. 특정 패턴 추출
  // "참여자 수만큼" 패턴
  if (description.includes('참여자') || description.includes('참석자')) {
    materials.add(`사인펜 (${participantCount}개)`);
    materials.add(`이름표 (${participantCount}개)`);
  }

  // 포스트잇 색상 추출
  const colorMatches = description.match(/(노란색|분홍색|초록색|파란색|빨간색|노랑|분홍|초록|파랑|빨강)/g);
  if (colorMatches) {
    const colors = [...new Set(colorMatches)];
    materials.add(`포스트잇 (${colors.join(', ')} 색상)`);
  }

  return Array.from(materials);
}

/**
 * 참여자 수로부터 조 수 계산 (조당 3-4명 기준)
 */
function calculateGroupCount(participantCount: number): number {
  // 조당 3-4명 기준으로 계산
  const groupSize = 4;
  const groupCount = Math.ceil(participantCount / groupSize);
  // 최소 1조는 보장
  return Math.max(1, groupCount);
}

/**
 * 워크숍 전체 준비물을 단계별로 분류하여 정리
 */
export function organizeMaterialsByStep(
  steps: WorkshopStep[],
  participantCount: number,
  flipchartAvailable: boolean,
  recommendedGroups?: number // participantManagement에서 가져온 추천 그룹 수 (선택)
): {
  commonMaterials: string[]; // 공통 준비물
  stepMaterials: Map<string, string[]>; // 단계별 준비물
  wallSetup: string[]; // 벽 세팅 항목
} {
  const commonMaterials: Set<string> = new Set();
  const stepMaterials = new Map<string, string[]>();
  const wallSetup: Set<string> = new Set();

  // 조 수 계산 (추천 그룹 수가 있으면 사용, 없으면 계산)
  const groupCount = recommendedGroups || calculateGroupCount(participantCount);

  // 공통 준비물 (참석자 수만큼)
  commonMaterials.add(`포스트잇 (${participantCount}개)`);
  commonMaterials.add(`사인펜 (${participantCount}개)`);
  commonMaterials.add(`이름표 (${participantCount}개)`);
  commonMaterials.add(`신호등카드 (${participantCount}개)`);
  
  // 마커펜 (조당 검정 3개, 초록/파랑/빨강 각 1개씩)
  const blackMarkersPerGroup = 3;
  const coloredMarkersPerGroup = 3; // 초록, 파랑, 빨강 각 1개씩
  commonMaterials.add(`마커펜 검정 (조당 ${blackMarkersPerGroup}개, 총 ${groupCount * blackMarkersPerGroup}개)`);
  commonMaterials.add(`마커펜 초록 (조당 1개, 총 ${groupCount}개)`);
  commonMaterials.add(`마커펜 파랑 (조당 1개, 총 ${groupCount}개)`);
  commonMaterials.add(`마커펜 빨강 (조당 1개, 총 ${groupCount}개)`);
  
  if (flipchartAvailable) {
    commonMaterials.add('플립차트 2대');
  }

  // 벽 세팅 기본 항목
  wallSetup.add('Ground Rule');
  wallSetup.add('Parking Board');
  wallSetup.add('스티키월 (sticky wall)');

  // 각 단계별 준비물 추출
  steps.forEach(step => {
    const stepMats = extractMaterialsFromStep(step, participantCount);
    stepMaterials.set(step.id, stepMats);

    // 단계별 준비물을 공통 준비물에 추가 (중복 제거)
    stepMats.forEach(mat => {
      // "참여자 수만큼" 패턴은 제외 (이미 추가됨)
      if (!mat.includes('참여자 수만큼') && !mat.includes('참석자 수만큼')) {
        commonMaterials.add(mat);
      }
    });

    // 벽 세팅 항목 추출
    const desc = step.description.toLowerCase();
    if (desc.includes('롤지') || desc.includes('roll paper')) {
      wallSetup.add('롤지 (2m 이상)');
    }
    if (desc.includes('차트') || desc.includes('chart')) {
      wallSetup.add('차트지');
    }
    if (desc.includes('최종 산출물') || desc.includes('final output')) {
      wallSetup.add('최종 산출물 양식 (A0)');
    }
  });

  return {
    commonMaterials: Array.from(commonMaterials),
    stepMaterials,
    wallSetup: Array.from(wallSetup),
  };
}

/**
 * 기존 preparation 객체를 워크숍 프로세스에 맞게 보완
 */
export function enhancePreparation(
  existingPreparation: WorkshopPreparation,
  steps: WorkshopStep[],
  participantCount: number,
  flipchartAvailable: boolean,
  recommendedGroups?: number // participantManagement에서 가져온 추천 그룹 수 (선택)
): WorkshopPreparation {
  const organized = organizeMaterialsByStep(steps, participantCount, flipchartAvailable, recommendedGroups);

  // 기존 materials에서 중복 제거 및 정리
  const existingMaterialsSet = new Set(existingPreparation.materials);
  
  // 기존 materials에서 "참여자 수만큼" 패턴 제거 (새로운 정확한 수량으로 대체)
  const cleanedExisting = Array.from(existingMaterialsSet).filter(material => {
    return !material.includes('참여자 수만큼') && 
           !material.includes('참석자 수만큼') &&
           !material.match(/포스트잇|사인펜|이름표|신호등카드|마커펜.*참여자|마커펜.*검정.*컬러/i);
  });

  // 새로운 정확한 수량의 준비물과 병합
  const enhancedMaterials = new Set([
    ...cleanedExisting,
    ...organized.commonMaterials,
  ]);

  // roomSetup 보완
  const enhancedRoomSetup = existingPreparation.roomSetup
    ? `${existingPreparation.roomSetup}\n\n**벽 세팅:**\n${organized.wallSetup.map(item => `- ${item}`).join('\n')}`
    : `**공간 배치:**\n- 원형 또는 조별 테이블 배치\n- 중앙에 플립차트 배치\n- 벽면에 스티키월 공간 확보\n\n**벽 세팅:**\n${organized.wallSetup.map(item => `- ${item}`).join('\n')}`;

  return {
    materials: adjustedMaterials,
    roomSetup: enhancedRoomSetup,
    preWorkshopTasks: existingPreparation.preWorkshopTasks,
    participantPreBrief: existingPreparation.participantPreBrief,
  };
}

/**
 * 단계별 체크리스트 생성
 */
export function generateStepChecklist(
  step: WorkshopStep,
  participantCount: number
): string[] {
  const checklist: string[] = [];
  const materials = extractMaterialsFromStep(step, participantCount);

  checklist.push(`[${step.type}] ${step.title} 준비`);
  
  materials.forEach(material => {
    checklist.push(`  ✓ ${material} 준비 완료`);
  });

  // 특정 단계별 추가 체크리스트
  if (step.type === '오프닝') {
    checklist.push('  ✓ Ground Rule 차트 부착');
    checklist.push('  ✓ Parking Board 준비');
    checklist.push('  ✓ 참여자 이름표 배치');
  }

  if (step.techniques.includes('Presentation')) {
    checklist.push('  ✓ 프로젝터 및 화면 테스트');
    checklist.push('  ✓ 발표용 차트 준비');
  }

  if (step.techniques.includes('Gallery Walk')) {
    checklist.push('  ✓ 롤지 벽면 부착');
    checklist.push('  ✓ 스티키월 공간 확보');
  }

  return checklist;
}

