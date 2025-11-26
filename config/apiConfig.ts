/**
 * API 설정 및 검증
 * 
 * @module config/apiConfig
 * @deprecated Use {@link config/env} instead for type-safe environment variables
 */

import { env } from './env';

export interface ApiConfig {
    geminiApiKey: string;
}

/**
 * API 설정을 가져오고 검증합니다.
 * 
 * @returns API 설정 객체
 * @throws {Error} 프로덕션 환경에서 API 키가 없을 경우
 * @deprecated Use {@link config/env} instead
 */
export const getApiConfig = (): ApiConfig | null => {
    const apiKey = env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        if (env.DEV) {
            console.warn("⚠️ 개발 모드: Gemini API 키가 설정되지 않았습니다.");
            return null;
        }
        throw new Error(
            "Gemini API 키가 설정되지 않았습니다. " +
            "환경 변수 VITE_GEMINI_API_KEY를 확인해주세요."
        );
    }
    
    return { geminiApiKey: apiKey };
};

/**
 * Gemini API 키를 안전하게 가져옵니다.
 * 개발 환경에서는 null을 반환할 수 있습니다.
 * 
 * @deprecated Use {@link config/env} instead
 */
export const getGeminiApiKey = (): string | null => {
    const config = getApiConfig();
    return config?.geminiApiKey || null;
};

