import { GoogleGenAI, Type } from "@google/genai";
import type { WorkshopGenerationResult, WorkshopAnalysis, WorkshopStep } from "../types";
import { handleApiError, getErrorMessage } from "../utils/errorHandler";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 설정해 주세요.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Extracts a JSON object from a string that might be wrapped in markdown code blocks
 * or have other text around it.
 * @param text The raw text from the AI model.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
function extractJson<T = unknown>(text: string): T {
    const jsonMatch = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
    let jsonText;
    
    if (jsonMatch && jsonMatch[2]) {
        jsonText = jsonMatch[2];
    } else {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonText = text.substring(firstBrace, lastBrace + 1);
        } else {
            jsonText = text;
        }
    }

    try {
        return JSON.parse(jsonText) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", jsonText);
        throw new Error("AI가 유효한 JSON 형식을 반환하지 않았습니다.");
    }
}

export const generateWorkshopProcess = async (
    purpose: string, 
    product: string, 
    participantsInfo: string, 
    duration: number, 
    participants: number, 
    workshopType: string, 
    flipchartAvailable: boolean
): Promise<WorkshopGenerationResult> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }
    const productText = product || '명시되지 않음. 목적에 맞춰 추론할 것.';
    const participantsInfoText = participantsInfo || '일반적인 직장인으로 가정.';
    const flipchartText = flipchartAvailable ? '예' : '아니오';
    const totalMinutes = duration * 60;

    const prompt = `당신은 Liink 컨설팅의 최고 수준의 수석 퍼실리테이터이자 데이터 분석가입니다. 제공된 조직의 문제 상황을 해결하기 위한 상세한 워크숍 프로세스를 설계하고, 동시에 워크숍의 성공 가능성을 다각도로 분석하여 데이터 기반의 진단 리포트를 함께 제공해야 합니다. 아래 제공되는 다양한 유형의 최고 품질 예시들을 학습하여, 그에 준하는 깊이와 구체성을 갖춘 계획과 분석을 JSON 객체 형식으로 제안해 주세요.

**핵심 원칙:**
1.  **3P 분석 기반 설계:** 워크숍의 Purpose(목적), Product(결과물), Participant(참석자)를 깊이 분석하고 모든 설계의 기반으로 삼습니다.
2.  **데이터 기반 진단:** 워크숍의 성공 가능성을 객관적으로 평가하기 위해 5가지 핵심 지표를 1-5점 척도로 평가하고, 퍼실리테이터의 필요 역량 수준을 0-100점으로 계량화합니다.
3.  **실행 가능성:** 생성되는 계획은 누가 보더라도 워크숍을 바로 진행할 수 있을 정도로 상세하고 구체적이어야 합니다.

---
**[최고 품질의 설계 및 분석 예시 (Few-shot)]**
다음은 다양한 유형('조직 신뢰', '프로세스 개선', '상품 기획')의 워크숍에 대한 모범적인 설계 및 분석 예시입니다. 이 예시들의 구조, 상세함, 사용된 기법, 그리고 'analysis' 객체에 포함된 데이터 시각화용 지표까지 완벽하게 학습하여 요청된 설계에 동일한 수준의 품질을 적용해 주세요.

**[첫 번째 예시: 조직 내 신뢰 문제 해결 워크숍 (3시간)]**
\`\`\`json
{
  "plan": [
    {
      "type": "오프닝",
      "title": "워크숍의 시작: 왜 '신뢰'인가?",
      "duration": 20,
      "description": "#### 주요 활동\\n1. 퍼실리테이터 및 워크숍 목표 소개 (5분)\\n2. '신호등 체크인'을 통해 참여자들의 현재 컨디션, 기대감 공유 (10분)\\n3. 워크숍의 그라운드룰(Ground Rule) 'Open Mind' 수립 (5분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 이 자리에서 어떤 이야기를 솔직하게 나누고 싶으신가요?'",
      "techniques": "Check-in, Ground Rule Setting",
      "techniquesRationale": "초반 분위기를 형성하고, 참여자들의 솔직한 참여를 유도하기 위해 심리적 안전감을 만드는 활동들로 구성했습니다."
    },
    { "type": "휴식", "title": "Coffee Break", "duration": 10, "description": "휴식", "techniques": "Break", "techniquesRationale": "집중력 환기" },
    {
      "type": "본론",
      "title": "신뢰 경험 탐색 및 조직 내 신뢰 진단",
      "duration": 90,
      "description": "#### 주요 활동\\n1. 개인별 회고: '나를 신뢰하고 성장시킨 리더' 경험 작성 (10분)\\n2. 조별 공유 및 신뢰 요소 도출 (20분)\\n3. 역장 분석(Force Field Analysis): 조직 신뢰의 촉진/저해 요인 도출 및 그룹핑, 투표 (45분)\\n4. 핵심 요인 토의 (15분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '그 리더의 어떤 행동이 당신에게 깊은 신뢰를 주었나요?'\\n- '우리 조직의 신뢰를 쌓는 데 가장 큰 걸림돌은 무엇이며, 그 근본 원인은 어디에 있을까요?'",
      "techniques": "Storytelling, Force Field Analysis, Brainwriting, Affinity Diagram, Dot-voting",
      "techniquesRationale": "추상적인 '신뢰' 개념을 개인의 구체적인 경험과 연결시키고, 긍정적/부정적 요인을 함께 분석하여 균형 잡힌 시각을 제공하며 근본 원인에 집중하도록 유도합니다."
    },
    {
      "type": "클로징",
      "title": "신뢰 회복을 위한 나의 Action Plan",
      "duration": 60,
      "description": "#### 주요 활동\\n1. Elevator Speech 준비: '신뢰'의 중요성을 1분 안에 설명하는 스피치 작성 (20분)\\n2. 나의 Action Plan 수립: '내일부터 당장 실천할 행동' 1가지 작성 (20분)\\n3. 전체 공유 및 상호 피드백 (20분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 논의를 통해 얻은 가장 중요한 깨달음 한 가지는 무엇인가요?'\\n- '내일 아침, 당신의 팀원들은 당신의 어떤 변화를 가장 먼저 보게 될까요?'",
      "techniques": "Action Planning, Elevator Speech, Peer Feedback, Commitment Declaration",
      "techniquesRationale": "워크숍의 깨달음이 실제 행동 변화로 이어지도록 구체적인 실천 계획과 다짐을 유도하기 위함입니다."
    }
  ],
  "analysis": {
    "difficulty": "어려움",
    "difficultyReason": "리더십과 신뢰라는 민감한 주제를 다루며, 개인의 깊은 경험과 성찰을 이끌어내야 합니다. 특히 역장 분석 단계에서 조직의 문제를 솔직하게 드러내고 건설적인 토론으로 연결하기 위해서는 숙련된 퍼실리테이션 기술이 필수적입니다.",
    "metrics": [
      { "label": "주제 복잡성", "value": 4 },
      { "label": "결과물 도출 난이도", "value": 3 },
      { "label": "참여자 동기부여", "value": 3 },
      { "label": "참여자 간 갈등 가능성", "value": 5 },
      { "label": "의사결정 필요성", "value": 2 }
    ],
    "facilitatorCompetency": 85,
    "keySuccessFactors": [
      { "title": "심리적 안전감 확보", "description": "참여자들이 솔직하게 자신의 의견과 경험을 공유할 수 있도록, 퍼실리테이터는 비판과 평가가 없는 안전한 환경을 조성해야 합니다." },
      { "title": "구체적인 경험 기반 논의", "description": "추상적인 '신뢰'에 대해 논하기보다, 실제 성공/실패 경험을 바탕으로 대화해야 실질적인 해결책을 도출할 수 있습니다." }
    ]
  }
}
\`\`\`

---
**[두 번째 예시: 업무 프로세스 효율화 워크숍 (7시간)]**
\`\`\`json
{
  "plan": [
    {
      "type": "오프닝",
      "title": "워크숍 오프닝 및 아이스브레이킹",
      "duration": 40,
      "description": "#### 주요 활동\\n1. 워크숍 취지, 목표 안내 및 퍼실리테이터 소개 (5분)\\n2. 신호등 체크인 (5분)\\n3. 아이스브레이킹: '나의 이상적인 하루' 조별 공유 (20분)\\n4. 그라운드 룰 및 Parking Board 안내 (10분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 워크숍이 끝났을 때, 어떤 변화가 있었으면 좋겠나요?'",
      "techniques": "Check-in, Icebreaking, Ground Rule Setting, Parking Board",
      "techniquesRationale": "워크숍의 목적을 명확히 하고, 참여자들이 편안하고 개방적인 분위기에서 서로의 의견을 나눌 수 있도록 심리적 안전감을 형성하는 데 중점을 둡니다."
    },
    {
      "type": "본론",
      "title": "Warming up: 우리 팀의 강점과 아쉬운 점",
      "duration": 35,
      "description": "#### 주요 활동\\n1. 이미지 카드를 활용하여 우리 팀의 'Proud & Sorry' 조별 공유 및 차트 기록 (15분)\\n2. 전체 공유 (10분)\\n3. 느낀점 발표 (5분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '우리 팀의 가장 자랑스러운 순간은 언제였나요?'\\n- '성과를 내기 위해 빠르게 개선하고 싶은 아쉬운 점은 무엇인가요?'",
      "techniques": "Image Card, Proud & Sorry, Round Robin",
      "techniquesRationale": "본격적인 문제 분석에 앞서, 팀의 긍정적 측면과 개선점을 가볍게 탐색하며 논의의 물꼬를 틉니다. 이미지 카드를 사용하여 창의적이고 감성적인 접근을 유도합니다."
    },
    { "type": "휴식", "title": "Break time", "duration": 15, "description": "휴식", "techniques": "Break", "techniquesRationale": "집중력 환기" },
    {
      "type": "본론",
      "title": "업무 프로세스 현황 점검 및 Pain Point 도출",
      "duration": 60,
      "description": "#### 주요 활동\\n1. Sticky wall에 모여 우리 팀 주요 업무 흐름 확인 및 과업/요소 작성 (15분)\\n2. 조별 단계 별 Pain Point 브레인스토밍 및 차트 기록 (20분)\\n3. Sticky wall에서 전체 공유 및 유사 의견 그룹핑 (20분)\\n4. 시급성/효과성 기반 Pain Point 다중 투표 및 Top 3~5 선정 (5분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '우리가 하는 일의 흐름에서 가장 비효율적이라고 느끼는 부분은 어디인가요?'\\n- '이 문제 때문에 어떤 어려움을 겪고 있나요?'",
      "techniques": "Process Mapping, Brainstorming, Affinity Diagram, Dot-voting",
      "techniquesRationale": "전체 업무 흐름을 시각적으로 공유하여 공통의 이해를 만들고, 개인의 경험에 기반한 Pain Point를 발산, 수렴하여 가장 핵심적인 문제를 객관적으로 선정합니다."
    },
    { "type": "휴식", "title": "Lunch time", "duration": 60, "description": "점심 식사", "techniques": "Break", "techniquesRationale": "에너지 보충" },
    {
      "type": "본론",
      "title": "핵심 문제 원인 분석 및 개선 아이디어 발산",
      "duration": 50,
      "description": "#### 주요 활동\\n1. '왜 발생한 문제일까?' 원인 분석 브레인스토밍 (10분)\\n2. 조별 아이디어 그룹핑 및 공유 (15분)\\n3. Gallery Walk를 통해 다른 조의 원인 분석 결과 확인 및 스티커 투표 (10분)\\n4. 피드백 확인 후 조별 핵심 원인 1가지 선정 (15분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '이 문제가 계속해서 발생하는 근본적인 이유는 무엇이라고 생각하나요?'",
      "techniques": "Root Cause Analysis (5 Whys), Brainwriting, Gallery Walk, Sticker Voting",
      "techniquesRationale": "문제의 표면적인 현상이 아닌 근본 원인에 집중하도록 유도합니다. Gallery Walk를 통해 다양한 시각을 교류하고, 가장 설득력 있는 원인에 대한 공감대를 형성합니다."
    },
    {
      "type": "본론",
      "title": "개선 방안 아이디어 발산 및 선정",
      "duration": 65,
      "description": "#### 주요 활동\\n1. 개선 방안 아이디어 브레인스토밍 (12분)\\n2. 효과성/실행가능성 기반 아이디어 6개 선정 (8분)\\n3. Pay-off Matrix를 활용하여 포스트잇 부착 및 최종 아이디어 확정 (10분)\\n4. 1사분면(Quick Win) 아이디어 최종 확정 및 공유 (5분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '이 근본 원인을 해결하기 위해 우리가 당장 시도해볼 수 있는 작은 행동은 무엇일까요?'",
      "techniques": "Brainstorming, Pay-off Matrix, Idea Selection",
      "techniquesRationale": "실현 가능성과 효과성을 기준으로 아이디어를 평가하여, 적은 노력으로 높은 효과를 볼 수 있는 'Quick Win' 과제에 집중함으로써 즉각적인 성공 경험과 실행 동력을 확보합니다."
    },
    { "type": "휴식", "title": "Break time", "duration": 15, "description": "휴식", "techniques": "Break", "techniquesRationale": "집중력 환기" },
    {
      "type": "클로징",
      "title": "Action Plan 수립 및 워크숍 마무리",
      "duration": 80,
      "description": "#### 주요 활동\\n1. 선정 아이디어 Action Plan 초안 작성 (40분): As-is, To-be, How, Who, When\\n2. 최종 Action Plan 시트 작성 및 발표 (30분)\\n3. 감정 카드를 활용한 워크숍 소감 발표 (10분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '이 계획이 성공적으로 실행되기 위해 가장 중요한 것은 무엇일까요?'\\n- '오늘 워크숍을 통해 무엇을 얻었고, 앞으로 어떤 기여를 하고 싶으신가요?'",
      "techniques": "Action Planning, Presentation, Check-out (Emotion Card)",
      "techniquesRationale": "논의된 결과를 구체적인 실행 계획으로 전환하여 책임과 기한을 명확히 합니다. 감정 카드를 통한 소감 공유로 워크숍 경험을 긍정적으로 마무리하고 팀의 유대감을 강화합니다."
    }
  ],
  "analysis": {
    "difficulty": "어려움",
    "difficultyReason": "기존 업무 방식의 문제점을 직접적으로 다루기 때문에, 부서 간/개인 간 이해관계 충돌이나 저항이 발생할 수 있습니다. 다양한 의견을 수렴하여 구체적인 실행 계획으로 합의를 이끌어내는 과정에 높은 수준의 갈등 관리 및 의사결정 촉진 능력이 요구됩니다.",
    "metrics": [
      { "label": "주제 복잡성", "value": 4 },
      { "label": "결과물 도출 난이도", "value": 4 },
      { "label": "참여자 동기부여", "value": 3 },
      { "label": "참여자 간 갈등 가능성", "value": 4 },
      { "label": "의사결정 필요성", "value": 5 }
    ],
    "facilitatorCompetency": 80,
    "keySuccessFactors": [
      { "title": "구체적인 문제 정의", "description": "추상적인 불평불만에서 벗어나, '누가', '언제', '어떤' 어려움을 겪는지 명확하게 문제를 정의해야 실질적인 해결책을 찾을 수 있습니다." },
      { "title": "실행 가능한 Action Plan", "description": "거창한 계획보다는 90일 안에 실행 가능한 작고 구체적인 행동 계획(Action Plan)을 수립하여 즉각적인 성공 경험을 만드는 것이 중요합니다." }
    ]
  }
}
\`\`\`

---
**[세 번째 예시: 상품 기획/개발 스페셜 미팅 (1일)]**
\`\`\`json
{
  "plan": [
    {
      "type": "오프닝",
      "title": "오프닝 및 아이스브레이킹",
      "duration": 40,
      "description": "#### 주요 활동\\n1. 워크숍 취지 및 목표 안내 (5분)\\n2. 신호등 체크인: 컨디션/자발성/공감도 확인 (10분)\\n3. 아이스브레이킹: '나의 이상적인 하루' + '기대사항' 작성 후 돌아가며 자기소개 (25분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 이 자리를 통해 어떤 궁금증을 해결하고 싶으신가요?'",
      "techniques": "Check-in, Icebreaking, Expectation Sharing",
      "techniquesRationale": "워크숍의 목표와 각자의 기대사항을 공유하여 공감대를 형성하고, 개인적인 이야기를 통해 상호 이해를 높여 솔직한 대화를 위한 기반을 마련합니다."
    },
    {
      "type": "본론",
      "title": "논의의 전제 및 그라운드 룰 세팅",
      "duration": 15,
      "description": "#### 주요 활동\\n1. 논의의 전제 공유: '모두가 자신의 일에 최선을 다한다'는 믿음 확인 (5분)\\n2. 화법 안내: '(관찰한 사실/근거) + I-message'로 말하기 연습 (5분)\\n3. 그라운드 룰 수립: '시원하게, 뒤끝없기, 원팀 마인드' (5분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 우리가 최고의 팀워크를 발휘하기 위해 어떤 약속이 필요할까요?'",
      "techniques": "Setting the Premise, I-Message, Ground Rule Setting",
      "techniquesRationale": "부서 간 갈등 가능성이 있는 주제를 다루기 전, 상호 존중과 신뢰의 원칙을 세워 심리적 안전감을 확보하고 건설적인 커뮤니케이션 방식을 약속합니다."
    },
    {
      "type": "본론",
      "title": "관점 나누기: 비즈니스 별 경험 공유",
      "duration": 40,
      "description": "#### 주요 활동\\n1. 이슈 요약 및 비즈니스 별 경험/관점 나누기 조별 토의 (20분)\\n2. 조별 토의 결과 전체 발표 (20분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '상품 기획/개발 과정에서, 우리 부서가 겪는 가장 큰 어려움은 무엇인가요?'",
      "techniques": "Perspective Sharing, Group Discussion, Presentation",
      "techniquesRationale": "각 부서(기획, 개발, 연구 등)가 가진 고유의 시각과 어려움을 표면으로 드러내어, 문제에 대한 다각적인 이해를 돕고 서로의 입장을 공감하게 합니다."
    },
    { "type": "휴식", "title": "Break time", "duration": 15, "description": "휴식", "techniques": "Break", "techniquesRationale": "집중력 환기" },
    {
      "type": "본론",
      "title": "개선의 실마리 찾기: 상호 기대사항 정리",
      "duration": 80,
      "description": "#### 주요 활동\\n1. 비즈 간 상호 기대(요구) 사항 정리 (15분, 기획-분홍, 개발-초록, 연구-파랑 포스트잇)\\n2. 해결의 실마리(핵심 문제) 정리 (15분, 노랑 포스트잇)\\n3. Sticky wall 앞에 모여 전체 공유 및 질의응답 (50분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '업무 효율을 높이기 위해, 다른 부서에 무엇을 기대하거나 요청하고 싶으신가요?'\\n- '우리가 공통적으로 가장 중요하게 해결해야 할 문제는 무엇일까요?'",
      "techniques": "Mutual Expectation, Affinity Diagram, Silent Writing",
      "techniquesRationale": "문제 제기를 넘어, 부서 간의 구체적인 요구사항과 기대사항을 명확히 하여 해결의 방향성을 구체화합니다. 색깔이 다른 포스트잇을 사용하여 시각적으로 의견을 분류하고 이해를 돕습니다."
    },
    { "type": "휴식", "title": "Lunch break", "duration": 70, "description": "점심 식사", "techniques": "Break", "techniquesRationale": "에너지 보충 및 네트워킹" },
    {
      "type": "본론",
      "title": "개선 아이디어 구체화",
      "duration": 60,
      "description": "#### 주요 활동\\n1. 오후 Spot 활동: 불친절한 초상화 (15분)\\n2. 논의하고 싶은 주제 선택 및 새로운 조 구성 (10분)\\n3. 개선 아이디어 자유롭게 나누기 (차트 기록) (35분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오전에 논의된 문제를 해결하기 위한 창의적이고 실질적인 아이디어는 무엇이 있을까요?'",
      "techniques": "Spot Activity, Idea Generation, Brainstorming",
      "techniquesRationale": "점심 식사 후 새로운 조를 구성하여 새로운 관점을 유도하고, 자유로운 아이디어 발산을 통해 해결책의 범위를 넓힙니다. 차트를 활용하여 논의 내용을 체계적으로 기록합니다."
    },
    { "type": "휴식", "title": "Break time", "duration": 15, "description": "휴식", "techniques": "Break", "techniquesRationale": "집중력 환기" },
    {
      "type": "클로징",
      "title": "아이디어 공유 및 피드백",
      "duration": 60,
      "description": "#### 주요 활동\\n1. 조별 개선 아이디어 발표 (4분 x 5조 = 20분)\\n2. 신호등 카드를 이용한 공감도 확인 및 피드백 의견 수렴 (PP&E) (15분)\\n3. 피드백 기반 아이디어 보완 (5분)\\n4. 워크숍 과정 회고 및 결과 요약, Next step 안내 (20분)\\n\\n#### 퍼실리테이터의 핵심 질문\\n- '오늘 논의된 아이디어 중, 우리 조직에 가장 큰 긍정적 변화를 가져올 것은 무엇이라고 생각하나요?'",
      "techniques": "Presentation, Feedback (Traffic Light Card), PP&E (Positives, Potentials, and Enablers), Wrap-up",
      "techniquesRationale": "아이디어 발표와 구조화된 피드백(신호등 카드, PP&E)을 통해 집단 지성을 활용하고 아이디어의 완성도를 높입니다. 명확한 Next step 안내로 워크숍 결과가 후속 조치로 이어지도록 합니다."
    }
  ],
  "analysis": {
    "difficulty": "전문가 필요",
    "difficultyReason": "상품 기획-개발-연구 등 각기 다른 목표와 KPI를 가진 핵심 부서들이 참여하여 첨예한 이해관계를 조율해야 합니다. 잘못된 개입은 부서 간 갈등을 심화시킬 수 있어, 고도의 중립성과 갈등 조정 능력을 갖춘 전문 퍼실리테이터가 필수적입니다.",
    "metrics": [
      { "label": "주제 복잡성", "value": 5 },
      { "label": "결과물 도출 난이도", "value": 4 },
      { "label": "참여자 동기부여", "value": 3 },
      { "label": "참여자 간 갈등 가능성", "value": 5 },
      { "label": "의사결정 필요성", "value": 4 }
    ],
    "facilitatorCompetency": 95,
    "keySuccessFactors": [
      { "title": "명확한 커뮤니케이션 규칙", "description": "워크숍 초반에 'I-Message'와 같은 구체적인 소통 방식을 합의하고, 퍼실리테이터가 이를 일관되게 적용하여 비난이 아닌 건설적인 대화가 오가도록 해야 합니다." },
      { "title": "공동의 목표 상기", "description": "부서별 입장을 넘어 '성공적인 신제품 출시'라는 공동의 목표를 지속적으로 상기시켜, '우리'의 관점에서 문제를 해결하도록 유도하는 것이 중요합니다." }
    ]
  }
}
\`\`\`
---
**[워크숍 설계 조건]**
- **Purpose (목적):** ${purpose}
- **Product (핵심 결과물):** ${productText}
- **Participant (참여자 정보):** ${participantsInfoText}
- **총 소요 시간 (엄격히 준수):** ${duration}시간
- **참여자 수:** ${participants}명
- **워크숍 유형:** ${workshopType}
- **플립차트 사용 가능:** ${flipchartText}

---
**[요청사항]**
위 예시들을 완벽하게 학습하여, 주어진 **[워크숍 설계 조건]**을 모두 충족하는 워크숍 상세 계획과 데이터 기반 분석을 **하나의 JSON 객체**로 작성해 주세요.

- **총 소요 시간(${duration}시간)에 맞춰, 모든 단계의 'duration' 값의 합이 정확히 ${totalMinutes}분이 되도록 각 단계의 시간을 동적으로 배분하고 최적화해야 합니다.**
- **\`description\` 필드 상세화:** 각 \`plan\` 객체의 \`description\` 필드는 예시와 같이 Markdown을 사용하여 '#### 주요 활동'과 '#### 퍼실리테이터의 핵심 질문' 두 섹션으로 명확히 구분해야 합니다. '주요 활동'에는 구체적인 실행 단계와 **단계별 예상 소요 시간(예: (5분))**을 포함하여 매우 상세하게 기술해야 합니다. 이는 워크숍의 실행 가능성을 높이는 핵심 요소입니다.
- **'analysis' 객체를 반드시 포함해야 하며, 그 안에는 다음 키들이 포함되어야 합니다:**
    - **difficulty, difficultyReason**: 퍼실리테이션 난이도('쉬움', '보통', '어려움', '전문가 필요')와 그 이유.
    - **metrics**: '주제 복잡성', '결과물 도출 난이도', '참여자 동기부여', '참여자 간 갈등 가능성', '의사결정 필요성' 5개 항목에 대해 1(낮음) ~ 5(높음)점 척도로 평가한 값을 포함하는 배열.
    - **facilitatorCompetency**: 이 워크숍을 성공적으로 이끌기 위해 필요한 퍼실리테이터의 역량 수준 (0 ~ 100점).
    - **keySuccessFactors**: 워크숍 성공을 위한 가장 중요한 조건 2가지를 'title'과 'description'으로 설명하는 객체 배열.
- 최종 결과는 **반드시 \`plan\`과 \`analysis\` 키를 포함한 JSON 객체 형식**이어야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    duration: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    techniques: { type: Type.STRING },
                                    techniquesRationale: { type: Type.STRING },
                                },
                                required: ["type", "title", "duration", "description", "techniques", "techniquesRationale"],
                            }
                        },
                        analysis: {
                            type: Type.OBJECT,
                            properties: {
                                difficulty: { type: Type.STRING },
                                difficultyReason: { type: Type.STRING },
                                metrics: { 
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            label: { type: Type.STRING },
                                            value: { type: Type.NUMBER }
                                        },
                                        required: ["label", "value"]
                                    }
                                },
                                facilitatorCompetency: { type: Type.NUMBER },
                                keySuccessFactors: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING }
                                        },
                                        required: ["title", "description"]
                                    }
                                }
                            },
                            required: ["difficulty", "difficultyReason", "metrics", "facilitatorCompetency", "keySuccessFactors"]
                        }
                    },
                    // FIX: Use a string literal "plan" instead of an undefined variable `plan`.
                    required: ["plan", "analysis"]
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<WorkshopGenerationResult>(rawText);
    } catch (error) {
        console.error("Error generating workshop process:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`워크숍 설계 생성에 실패했습니다: ${errorMessage}`);
    }
};

export const generateAlternativeStep = async (
    stepToReplace: WorkshopStep,
    fullPlan: WorkshopStep[],
    workshopContext: { purpose: string; product: string; participantsInfo: string; }
): Promise<Omit<WorkshopStep, 'id'>> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }
    
    const contextPrompt = `
        **워크숍 전체 맥락 (3P):**
        - **Purpose (목적):** ${workshopContext.purpose}
        - **Product (핵심 결과물):** ${workshopContext.product}
        - **Participant (참여자 정보):** ${workshopContext.participantsInfo}

        **전체 워크숍 계획 (요약):**
        ${fullPlan.map(p => `- ${p.title} (${p.duration}분)`).join('\n')}

        **현재 교체 대상 단계:**
        - **제목:** ${stepToReplace.title}
        - **유형:** ${stepToReplace.type}
        - **소요 시간:** ${stepToReplace.duration}분 (이 시간은 반드시 지켜야 합니다)
        - **현재 설명:** ${stepToReplace.description}
    `;

    const prompt = `당신은 Liink 컨설팅의 수석 워크숍 디자이너입니다. 주어진 워크숍의 전체 맥락과 계획을 참고하여, '현재 교체 대상 단계'를 대체할 새롭고 창의적인 아이디어를 제안해주세요.

    ${contextPrompt}

    **[요청사항]**
    1.  **새로운 활동 제안:** 현재 단계를 대체할 효과적인 활동을 구상하여 새로운 단계(Step)를 설계해주세요.
    2.  **시간 엄수:** 제안하는 새로운 단계의 'duration'은 반드시 기존 단계와 동일한 **${stepToReplace.duration}분**이어야 합니다.
    3.  **JSON 형식 준수:** 결과는 반드시 'type', 'title', 'duration', 'description', 'techniques', 'techniquesRationale' 키를 포함하는 **단일 JSON 객체**로 반환해주세요.
    4.  **'description' 필드 형식 준수:** 'description' 필드는 Markdown을 사용해야 하며, 반드시 다음 두 섹션으로 명확히 구분하여 작성해야 합니다.
        - **#### 주요 활동**: 구체적인 활동 내용을 단계별로, **각 단계별 예상 소요 시간(예: (10분))을 포함하여** 매우 상세하게 서술합니다.
        - **#### 퍼실리테이터의 핵심 질문**: 이 단계에서 퍼실리테이터가 던져야 할 핵심적인 질문들을 포함합니다.
        이 형식은 워크숍의 구체성과 실행 가능성을 보장하므로 반드시 지켜주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        duration: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        techniques: { type: Type.STRING },
                        techniquesRationale: { type: Type.STRING },
                    },
                    required: ["type", "title", "duration", "description", "techniques", "techniquesRationale"],
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<Omit<WorkshopStep, 'id'>>(rawText);
    } catch (error) {
        console.error("Error generating alternative step:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`대체 단계 생성에 실패했습니다: ${errorMessage}`);
    }
};

export const generate3PExample = async (
    workshopType: string
): Promise<{ purpose: string; product: string; participantsInfo: string; }> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }
    const prompt = `당신은 세계 최고 수준의 워크숍 퍼실리테이터입니다. 
    '${workshopType}' 유형의 워크숍에 대한 고품질 3P(Purpose, Product, Participant) 분석 예시를 생성해 주세요. 
    각 항목은 명확하고 간결해야 하며, 실제 워크숍 설계에 바로 사용할 수 있을 만큼 구체적이어야 합니다.
    결과는 반드시 'purpose', 'product', 'participantsInfo' 키를 가진 JSON 객체 형식으로 반환해야 합니다.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        purpose: { type: Type.STRING, description: "워크숍의 목적 예시" },
                        product: { type: Type.STRING, description: "워크숍의 핵심 결과물 예시" },
                        participantsInfo: { type: Type.STRING, description: "워크숍 참여자 정보 예시" },
                    },
                    required: ["purpose", "product", "participantsInfo"],
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<{ purpose: string; product: string; participantsInfo: string; }>(rawText);
    } catch (error) {
        console.error("Error generating 3P example:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`3P 예시 생성에 실패했습니다: ${errorMessage}`);
    }
};

export const generate3PFromChat = async (
    answers: string[]
): Promise<{ purpose: string; product: string; participantsInfo: string; }> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }
    const conversation = `
        질문 1: 어떤 조직의 문제나 목표를 가지고 계신가요?
        답변 1: ${answers[0]}

        질문 2: 해당 이슈가 해결되었을 때, 가장 이상적으로 기대하는 결과물은 무엇인가요?
        답변 2: ${answers[1]}

        질문 3: 이 워크숍에 참여할 사람들은 누구이며, 그들의 현재 상황이나 입장은 어떤가요?
        답변 3: ${answers[2]}
    `;

    const prompt = `당신은 15년 경력의 시니어 OD 컨설턴트입니다. 고객과의 초기 미팅 대화 내용을 바탕으로, 워크숍 설계를 위한 3P(Purpose, Product, Participant)를 명확하고 간결하게 정리해야 합니다. 고객의 답변에서 핵심 의도를 파악하고, 전문적인 워크숍 설계 용어로 재구성해주세요. 결과는 반드시 JSON 객체 형식이어야 합니다.

    **[고객과의 대화 내용]**
    ${conversation}

    **[요청사항]**
    위 대화 내용을 분석하여 다음 3가지 항목을 추출하고 JSON 객체로 반환하세요.
    1.  **purpose**: 워크숍의 근본적인 목적 (Why)
    2.  **product**: 워크숍이 끝났을 때 손에 쥐게 될 가시적인 결과물 (What)
    3.  **participantsInfo**: 참여자들의 특징, 관계, 상황 요약 (Who)
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        purpose: { type: Type.STRING, description: "워크숍의 목적" },
                        product: { type: Type.STRING, description: "워크숍의 핵심 결과물" },
                        participantsInfo: { type: Type.STRING, description: "워크숍 참여자 정보" },
                    },
                    required: ["purpose", "product", "participantsInfo"],
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<{ purpose: string; product: string; participantsInfo: string; }>(rawText);
    } catch (error) {
        console.error("Error generating 3P from chat:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`대화 내용 분석에 실패했습니다: ${errorMessage}`);
    }
};

export const getTechniqueDetails = async (
    techniqueName: string,
): Promise<{ definition: string; rationale: string; alternatives: string[]; }> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }
    const prompt = `당신은 세계적인 퍼실리테이션 전문가입니다. 사용자가 궁금해하는 퍼실리테이션 기법에 대해 명확하고 간결하게 설명해주세요.

**[요청 기법]**
${techniqueName}

**[요청사항]**
위 기법에 대해 다음 3가지 항목을 포함하여 JSON 객체로 답변해주세요.
1.  **definition**: 기법의 정의와 기본적인 진행 방법을 2-3 문장으로 요약합니다.
2.  **rationale**: 이 기법이 '어떤 상황'에서 '왜' 효과적인지에 대한 전문가의 핵심적인 의견을 1-2 문장으로 설명합니다. (예: "참여자 간 아이디어 편차가 클 때, 시각적으로 아이디어를 그룹핑하고 우선순위를 정하는 데 효과적입니다.")
3.  **alternatives**: 비슷한 목적을 달성할 수 있는 대체 기법 2가지를 배열 형태로 제안합니다.

결과는 반드시 'definition', 'rationale', 'alternatives' 키를 가진 JSON 객체 형식이어야 합니다.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        definition: { type: Type.STRING, description: "기법의 정의 및 방법" },
                        rationale: { type: Type.STRING, description: "기법이 효과적인 이유" },
                        alternatives: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "대체 가능한 기법 목록"
                        },
                    },
                    required: ["definition", "rationale", "alternatives"],
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<{ definition: string; rationale: string; alternatives: string[]; }>(rawText);
    } catch (error) {
        console.error("Error getting technique details:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`기법 상세 정보를 가져오는데 실패했습니다: ${errorMessage}`);
    }
};