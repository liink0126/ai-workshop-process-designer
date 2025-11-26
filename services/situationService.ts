import { GoogleGenAI, Type } from "@google/genai";
import type { RealTimeSituation, SituationResponse, WorkshopStep, WorkshopData } from "../types";
import { getErrorMessage } from "../utils/errorHandler";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API 키가 설정되지 않았습니다.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Extracts a JSON object from a string that might be wrapped in markdown code blocks
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

export const analyzeSituationAndGetResponse = async (
    situation: RealTimeSituation,
    currentPlan: WorkshopStep[],
    workshopContext: WorkshopData,
    currentStepIndex: number
): Promise<SituationResponse> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }

    const currentStep = currentPlan[currentStepIndex];
    const remainingSteps = currentPlan.slice(currentStepIndex + 1);
    const remainingTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0);

    const prompt = `당신은 Liink 컨설팅의 수석 퍼실리테이터이자 실시간 워크숍 조정 전문가입니다. 워크숍 진행 중 발생한 상황을 분석하고, 즉시 실행 가능한 대응 전략을 제시해야 합니다.

**워크숍 전체 맥락:**
- 목적: ${workshopContext.purpose}
- 핵심 결과물: ${workshopContext.product}
- 참여자: ${workshopContext.participantsInfo}
- 총 소요 시간: ${workshopContext.duration}시간
- 참여자 수: ${workshopContext.participants}명

**현재 진행 상황:**
- 현재 단계: ${currentStep?.title || '시작 전'} (${currentStep?.duration || 0}분)
- 진행 단계: ${currentStepIndex + 1} / ${currentPlan.length}
- 남은 시간: 약 ${Math.floor(remainingTime / 60)}시간 ${remainingTime % 60}분
- 남은 단계: ${remainingSteps.map(s => s.title).join(', ') || '없음'}

**발생한 상황:**
- 상황 유형: ${situation.type}
- 심각도: ${situation.severity === 'high' ? '높음' : situation.severity === 'medium' ? '보통' : '낮음'}
- 상황 설명: ${situation.description}
- 발생 시점: ${situation.timestamp.toLocaleTimeString('ko-KR')}

**전체 워크숍 계획:**
${currentPlan.map((step, idx) => `${idx + 1}. ${step.title} (${step.duration}분) - ${step.type}`).join('\n')}

**[요청사항]**
위 상황을 분석하여 다음을 포함한 JSON 객체를 반환해주세요:

1. **analysis**: 상황의 원인과 영향 분석 (2-3문장)
2. **recommendedActions**: 즉시 실행 가능한 구체적인 조치 사항 배열 (3-5개)
3. **alternativeSteps** (선택): 현재 단계나 다음 단계를 대체할 수 있는 대안 활동 제안 (각 단계는 {type, title, duration, description, techniques, techniquesRationale} 형식)
4. **processAdjustments** (선택): 워크숍 프로세스 조정 방안
   - skipSteps: 건너뛸 수 있는 단계의 제목 배열
   - extendSteps: 시간을 연장할 단계와 추가 시간(분) 배열
   - modifySteps: 수정이 필요한 단계와 수정 내용 배열
5. **emergencyGuide** (심각도가 높을 때): 긴급 상황 대응 가이드

**중요 원칙:**
- 워크숍의 핵심 목적과 결과물을 반드시 달성할 수 있어야 함
- 참여자의 참여도와 동기를 유지하는 방향으로 조정
- 시간 제약을 고려한 현실적인 조치 제시
- 퍼실리테이터가 즉시 실행 가능한 구체적인 가이드 제공
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
                        analysis: { type: Type.STRING },
                        recommendedActions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        alternativeSteps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    duration: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    techniques: { type: Type.STRING },
                                    techniquesRationale: { type: Type.STRING }
                                },
                                required: ["type", "title", "duration", "description", "techniques", "techniquesRationale"]
                            }
                        },
                        processAdjustments: {
                            type: Type.OBJECT,
                            properties: {
                                skipSteps: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                },
                                extendSteps: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            stepId: { type: Type.STRING },
                                            additionalMinutes: { type: Type.NUMBER }
                                        },
                                        required: ["stepId", "additionalMinutes"]
                                    }
                                },
                                modifySteps: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            stepId: { type: Type.STRING },
                                            modifications: { type: Type.STRING }
                                        },
                                        required: ["stepId", "modifications"]
                                    }
                                }
                            }
                        },
                        emergencyGuide: { type: Type.STRING }
                    },
                    required: ["analysis", "recommendedActions"]
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<SituationResponse>(rawText);
    } catch (error) {
        console.error("Error analyzing situation:", error);
        const errorMessage = getErrorMessage(error);
        throw new Error(`상황 분석에 실패했습니다: ${errorMessage}`);
    }
};

