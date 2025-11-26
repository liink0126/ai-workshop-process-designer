import { Type } from "@google/genai";
import type { 
    WorkshopStep, 
    WorkshopData, 
    ProcessOption, 
    WorkshopGenerationResult,
    WorkshopAnalysis,
    WorkshopPreparation,
    ParticipantManagement,
    WorkshopExecution,
    WorkshopFollowUp
} from "../types";
import { getErrorMessage } from "../utils/errorHandler";
import { extractJson } from "../utils/jsonParser";
import { logger } from "../utils/logger";
import { callGeminiApi, ai } from "./geminiApiWrapper";


/**
 * 시간 변경 시 남은 프로세스를 재구성
 */
export const reorganizeRemainingProcess = async (
    completedSteps: WorkshopStep[],
    remainingTime: number, // 남은 시간 (분)
    originalPlan: WorkshopStep[],
    workshopContext: WorkshopData
): Promise<Omit<WorkshopStep, 'id'>[]> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다.");
    }

    const completedTime = completedSteps.reduce((sum, step) => sum + step.duration, 0);
    const completedTitles = completedSteps.map(s => s.title).join(', ');

    const prompt = `당신은 Liink 컨설팅의 수석 퍼실리테이터입니다. 워크숍 진행 중 시간이 변경되어 남은 프로세스를 재구성해야 합니다.

**워크숍 전체 맥락:**
- 목적: ${workshopContext.purpose}
- 핵심 결과물: ${workshopContext.product}
- 참여자: ${workshopContext.participantsInfo}
- 원래 총 시간: ${workshopContext.duration}시간

**이미 완료된 단계:**
${completedTitles || '없음'} (총 ${completedTime}분 소요)

**남은 시간:** ${remainingTime}분 (약 ${Math.floor(remainingTime / 60)}시간 ${remainingTime % 60}분)

**원래 계획의 남은 단계:**
${originalPlan.slice(completedSteps.length).map((s, i) => `${i + 1}. ${s.title} (${s.duration}분)`).join('\n') || '없음'}

**[요청사항]**
남은 시간(${remainingTime}분)에 맞춰 워크숍의 핵심 목적과 결과물을 반드시 달성할 수 있도록 새로운 프로세스를 설계해주세요.

1. **시간 엄수**: 모든 단계의 duration 합이 정확히 ${remainingTime}분이어야 합니다.
2. **핵심 목적 달성**: 워크숍의 목적(${workshopContext.purpose})과 결과물(${workshopContext.product})을 반드시 달성할 수 있어야 합니다.
3. **이미 완료된 내용 활용**: 이미 완료된 단계의 결과를 활용하여 남은 프로세스를 설계합니다.
4. **효율성**: 시간이 부족하면 핵심 활동에 집중하고, 시간이 남으면 심화 활동을 추가합니다.

각 단계는 {type, title, duration, description, techniques, techniquesRationale} 형식을 따르며, description은 Markdown 형식으로 '#### 주요 활동'과 '#### 퍼실리테이터의 핵심 질문' 섹션을 포함해야 합니다.

결과는 단계 배열을 반환하세요.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
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
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<Omit<WorkshopStep, 'id'>[]>(rawText);
    } catch (error) {
        logger.error("프로세스 재구성 실패", error, {
            remainingTime,
            completedStepsCount: completedSteps.length
        });
        throw new Error(`프로세스 재구성에 실패했습니다: ${getErrorMessage(error)}`);
    }
};

/**
 * 여러 프로세스 옵션 생성 (1-3개)
 */
export const generateMultipleProcessOptions = async (
    purpose: string,
    product: string,
    participantsInfo: string,
    duration: number,
    participants: number,
    workshopType: string,
    flipchartAvailable: boolean,
    optionCount: number = 3
): Promise<ProcessOption[]> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다.");
    }

    const prompt = `당신은 Liink 컨설팅의 수석 퍼실리테이터입니다. 동일한 워크숍 목적을 달성하기 위한 ${optionCount}가지 서로 다른 접근 방식을 가진 프로세스 옵션을 생성해야 합니다.

**워크숍 설계 조건:**
- 목적: ${purpose}
- 핵심 결과물: ${product}
- 참여자: ${participantsInfo}
- 총 시간: ${duration}시간
- 참여자 수: ${participants}명
- 워크숍 유형: ${workshopType}
- 플립차트 사용 가능: ${flipchartAvailable ? '예' : '아니오'}

**[요청사항]**
각 옵션은 서로 다른 접근 방식을 가져야 합니다:
- 옵션 1: 전통적이고 안정적인 접근
- 옵션 2: 혁신적이고 창의적인 접근
- 옵션 3: 효율적이고 실용적인 접근 (옵션 3개일 때)

각 옵션은 다음을 포함해야 합니다:
- plan: 워크숍 단계 배열
- analysis: 난이도 분석
- preparation: 실행 준비 정보
- participantManagement: 참여자 관리 가이드
- execution: 실행 가이드
- followUp: 후속 조치
- summary: 이 옵션의 특징 요약 (1-2문장)
- pros: 이 옵션의 장점 배열 (3-5개)
- cons: 이 옵션의 단점 배열 (2-3개)

모든 옵션은 동일한 목적과 결과물을 달성하되, 접근 방식이 다르고 각각의 장단점이 명확해야 합니다.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
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
                                        techniquesRationale: { type: Type.STRING }
                                    },
                                    required: ["type", "title", "duration", "description", "techniques", "techniquesRationale"]
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
                            },
                            preparation: {
                                type: Type.OBJECT,
                                properties: {
                                    materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    roomSetup: { type: Type.STRING },
                                    preWorkshopTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    participantPreBrief: { type: Type.STRING }
                                },
                                required: ["materials", "roomSetup", "preWorkshopTasks"]
                            },
                            summary: { type: Type.STRING },
                            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["plan", "analysis", "preparation", "summary", "pros", "cons"]
                    }
                }
            },
        });
        const rawText = response.text.trim();
        
        // 응답이 배열이 아닌 경우 처리
        let parsedResponse: unknown;
        try {
            parsedResponse = extractJson<unknown>(rawText);
        } catch (parseError) {
            // 파싱 실패 시 원본 텍스트 로깅
            logger.error("JSON 파싱 실패", parseError, { 
                rawTextPreview: rawText.substring(0, 500),
                rawTextLength: rawText.length 
            });
            throw new Error(`AI 응답을 처리하는 중 오류가 발생했습니다: ${getErrorMessage(parseError)}`);
        }
        
        // 배열이 아닌 경우 배열로 변환
        const options = Array.isArray(parsedResponse) 
            ? parsedResponse 
            : [parsedResponse];
        
        // 각 옵션에 id 추가 및 나머지 필드 생성
        interface RawProcessOption {
            plan?: Omit<WorkshopStep, 'id'>[];
            analysis?: WorkshopAnalysis;
            preparation?: WorkshopPreparation;
            participantManagement?: ParticipantManagement;
            execution?: WorkshopExecution;
            followUp?: WorkshopFollowUp;
            summary?: string;
            pros?: string[];
            cons?: string[];
        }
        
        return options.map((option: RawProcessOption) => ({
            id: crypto.randomUUID(),
            plan: option.plan || [],
            analysis: option.analysis || {
                difficulty: '보통',
                difficultyReason: '',
                metrics: [],
                facilitatorCompetency: 50,
                keySuccessFactors: []
            },
            preparation: option.preparation || {
                materials: [],
                roomSetup: '',
                preWorkshopTasks: []
            },
            participantManagement: option.participantManagement || undefined,
            execution: option.execution || undefined,
            followUp: option.followUp || undefined,
            summary: option.summary || '워크숍 프로세스 옵션',
            pros: Array.isArray(option.pros) ? option.pros : [],
            cons: Array.isArray(option.cons) ? option.cons : [],
        })) as ProcessOption[];
    } catch (error) {
        logger.error("다중 프로세스 생성 실패", error, {
            purpose: purpose.substring(0, 50),
            optionCount
        });
        throw new Error(`다중 프로세스 생성에 실패했습니다: ${getErrorMessage(error)}`);
    }
};

/**
 * 선택된 프로세스 옵션들을 기반으로 최종 프로세스 재구성
 */
export const finalizeProcessFromOptions = async (
    selectedOptions: ProcessOption[],
    workshopContext: WorkshopData
): Promise<WorkshopGenerationResult> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다.");
    }

    const optionsSummary = selectedOptions.map((opt, idx) => 
        `옵션 ${idx + 1}: ${opt.summary}\n장점: ${opt.pros.join(', ')}\n단점: ${opt.cons.join(', ')}`
    ).join('\n\n');

    const prompt = `당신은 Liink 컨설팅의 수석 퍼실리테이터입니다. 사용자가 선택한 여러 프로세스 옵션의 장점을 결합하여 최적의 최종 프로세스를 설계해야 합니다.

**워크숍 전체 맥락:**
- 목적: ${workshopContext.purpose}
- 핵심 결과물: ${workshopContext.product}
- 참여자: ${workshopContext.participantsInfo}
- 총 시간: ${workshopContext.duration}시간 (${workshopContext.duration * 60}분)
- 참여자 수: ${workshopContext.participants}명

**선택된 옵션들:**
${optionsSummary}

**[요청사항]**
선택된 옵션들의 장점을 결합하고 단점을 보완하여 최종 프로세스를 설계하세요:

1. **시간 엄수**: 총 시간이 정확히 ${workshopContext.duration * 60}분이어야 합니다.
2. **최적 조합**: 각 옵션의 강점을 결합하여 더 나은 프로세스 생성
3. **흐름 최적화**: 전체 워크숍의 흐름이 자연스럽고 논리적이어야 함
4. **실행 가능성**: 퍼실리테이터가 바로 실행할 수 있을 정도로 구체적

결과는 완전한 WorkshopGenerationResult 형식이어야 합니다 (plan, analysis, preparation, participantManagement, execution, followUp 포함).
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
                                    techniquesRationale: { type: Type.STRING }
                                },
                                required: ["type", "title", "duration", "description", "techniques", "techniquesRationale"]
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
                        },
                        preparation: {
                            type: Type.OBJECT,
                            properties: {
                                materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                                roomSetup: { type: Type.STRING },
                                preWorkshopTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                                participantPreBrief: { type: Type.STRING }
                            },
                            required: ["materials", "roomSetup", "preWorkshopTasks"]
                        },
                        participantManagement: {
                            type: Type.OBJECT,
                            properties: {
                                groupStrategy: {
                                    type: Type.OBJECT,
                                    properties: {
                                        recommendedGroups: { type: Type.NUMBER },
                                        groupSize: { type: Type.NUMBER },
                                        strategy: { type: Type.STRING },
                                        groupingOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["recommendedGroups", "groupSize", "strategy", "groupingOptions"]
                                }
                            },
                            required: ["groupStrategy"]
                        },
                        execution: {
                            type: Type.OBJECT,
                            properties: {
                                timerEnabled: { type: Type.BOOLEAN },
                                timeAdjustmentGuide: {
                                    type: Type.OBJECT,
                                    properties: {
                                        ifTimeShort: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        ifTimeExtra: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["ifTimeShort", "ifTimeExtra"]
                                }
                            },
                            required: ["timerEnabled"]
                        },
                        followUp: {
                            type: Type.OBJECT,
                            properties: {
                                actionPlans: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            task: { type: Type.STRING },
                                            owner: { type: Type.STRING },
                                            dueDate: { type: Type.STRING },
                                            status: { type: Type.STRING }
                                        },
                                        required: ["task", "owner", "dueDate", "status"]
                                    }
                                }
                            },
                            required: ["actionPlans"]
                        }
                    },
                    required: ["plan", "analysis", "preparation", "participantManagement", "execution", "followUp"]
                }
            },
        });
        const rawText = response.text.trim();
        return extractJson<WorkshopGenerationResult>(rawText);
    } catch (error) {
        logger.error("최종 프로세스 생성 실패", error, {
            selectedOptionsCount: selectedOptions.length
        });
        throw new Error(`최종 프로세스 생성에 실패했습니다: ${getErrorMessage(error)}`);
    }
};

