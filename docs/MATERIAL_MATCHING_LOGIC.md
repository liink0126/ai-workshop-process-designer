# 워크숍 준비물 매칭 로직 설계 문서

## 개요

워크숍 프로세스의 각 단계와 실제 필요한 준비물/체크리스트를 매칭하는 로직을 설계했습니다. 실제 워크숍 문서(KARI 아카데미 비전워크숍, 경기도공익활동지원센터 워크숍 등)의 패턴을 분석하여 구현했습니다.

## 핵심 설계 원칙

1. **단계 유형 기반 매핑**: 오프닝, 본론, 클로징, 휴식 등 단계 유형별 기본 준비물 제공
2. **기법 기반 추가 준비물**: Brainstorming, Gallery Walk, Multi-voting 등 사용 기법에 따른 추가 준비물 추출
3. **설명 텍스트 분석**: 단계 설명에서 키워드를 추출하여 특정 준비물 식별
4. **참여자 수 기반 수량 조정**: "참여자 수만큼" 패턴을 실제 인원수로 변환

## 매핑 규칙

### 1. 단계 유형별 기본 준비물

```typescript
STEP_TYPE_MATERIALS = {
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
  // ...
}
```

### 2. 기법별 추가 준비물

```typescript
TECHNIQUE_MATERIALS = {
  'Icebreaking': ['감정카드', '이미지카드', '크레파스 (12색)'],
  'Brainstorming': ['포스트잇 (다양한 색상)', '마커펜', '차트지'],
  'Gallery Walk': ['롤지 (2m 이상)', '스티키월', 'A6 색지'],
  'Multi-voting': ['스티커 (참여자 수만큼)', '투표용 차트'],
  // ...
}
```

### 3. 설명 텍스트 키워드 매핑

설명에서 특정 키워드를 찾아 관련 준비물을 추가합니다:
- "롤지" → 롤지 관련 준비물
- "sticky wall" → 스티키월
- "A6" → A6 색지/색카드
- "프로젝터" → 프로젝터
- 등등

### 4. 벽 세팅 항목 추출

워크숍 문서에서 확인된 벽 세팅 패턴:
- Ground Rule (기본)
- Parking Board (기본)
- 스티키월 (기본)
- 롤지 (단계에서 사용 시)
- 최종 산출물 양식 (A0) (최종 단계에서)

## 사용 방법

### 기본 사용

```typescript
import { enhancePreparation } from '../utils/workshopMaterialMatcher';

const enhanced = enhancePreparation(
  existingPreparation,  // AI가 생성한 기본 preparation
  steps,              // 워크숍 단계 배열
  participantCount,   // 참여자 수
  flipchartAvailable  // 플립차트 사용 가능 여부
);
```

### 단계별 준비물 추출

```typescript
import { extractMaterialsFromStep } from '../utils/workshopMaterialMatcher';

const materials = extractMaterialsFromStep(step, participantCount);
```

### 단계별 체크리스트 생성

```typescript
import { generateStepChecklist } from '../utils/workshopMaterialMatcher';

const checklist = generateStepChecklist(step, participantCount);
```

## 통합 위치

이 로직은 다음 위치에서 자동으로 적용됩니다:

1. **`services/geminiService.ts`** - `generateWorkshopProcess` 함수
   - 워크숍 생성 후 자동으로 준비물 보완

2. **`services/processOptimizationService.ts`** - `generateMultipleProcessOptions` 함수
   - 여러 옵션 생성 시 각 옵션의 준비물 보완

3. **`services/processOptimizationService.ts`** - `finalizeProcessFromOptions` 함수
   - 최종 프로세스 구성 시 준비물 보완

## 학습 데이터 기반

실제 워크숍 문서에서 확인된 패턴:

### KARI 아카데미 비전워크숍
- 조별 용품: 신호등카드, 포스트잇, 사인펜, 마커펜, 이젤패드
- 벽 세팅: SWOT, 이해관계자, 롤지, sticky wall
- 단계별: 아이스브레이킹(감정카드), 미션문 작성(롤지), 이해관계자 분석(A6 색카드)

### 경기도공익활동지원센터 워크숍
- 조별 용품: 신호등카드, 포스트잇, 사인펜, 스티커 이름표, 마커펜, 이젤스탠드 & 패드
- 벽 세팅: Ground Rule, Parking Board, 단체 별 최종 산출물 양식 (A0)
- 단계별: 캐릭터 분석(크레파스), Historical Scan(포스트잇, 이젤패드)

### 업무 프로세스 효율화 WS
- 조별 용품: 신호등카드, 포스트잇, 사인펜, 스티커 이름표, 마커펜, 회의용 이젤스탠드 & 패드
- 벽 세팅: Ground Rule, 기대사항, Parking Board
- 단계별: 아이스브레이킹(A4 용지), 이미지 카드 활용

## 향후 개선 방향

1. **더 많은 학습 데이터 수집**: 다양한 워크숍 유형의 실제 문서 분석
2. **기법 확장**: 새로운 기법이 추가될 때마다 매핑 규칙 업데이트
3. **맥락 기반 추론**: 워크숍 목적과 참여자 특성에 따른 더 정교한 준비물 추천
4. **수량 계산 로직 개선**: 그룹 수, 테이블 수 등을 고려한 더 정확한 수량 계산

