/**
 * Gemini API 래퍼
 * apiClient를 사용하여 최적화된 API 호출 제공
 */

import { GoogleGenAI } from "@google/genai";
import { apiClient } from "../utils/apiClient";
import { logger } from "../utils/logger";
import { getGeminiApiKey } from "../config/apiConfig";

const apiKey = getGeminiApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    logger.warn("Gemini API 키가 설정되지 않았습니다.");
}

/**
 * 최적화된 Gemini API 호출
 * 재시도, 타임아웃, 취소 기능 포함
 */
export const callGeminiApi = async <T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
        retry?: number;
        timeout?: number;
    }
): Promise<T> => {
    if (!ai) {
        throw new Error("AI 서비스가 초기화되지 않았습니다. API 키를 확인해 주세요.");
    }

    return apiClient.request(
        key,
        async (signal) => {
            // AbortSignal은 현재 Gemini SDK에서 직접 지원하지 않으므로
            // 요청 함수 내에서 처리
            try {
                return await requestFn();
            } catch (error) {
                if (signal.aborted) {
                    throw new Error('요청이 취소되었습니다.');
                }
                throw error;
            }
        },
        {
            retry: options?.retry ?? 1, // 기본 1회 재시도
            timeout: options?.timeout ?? 120000, // 기본 2분 타임아웃
        }
    );
};

export { ai };

