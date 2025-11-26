/**
 * 환경 변수 검증 및 관리
 * Zod를 사용하여 타입 안전한 환경 변수 관리
 */

import { z } from 'zod';

/**
 * 환경 변수 스키마 정의
 */
const envSchema = z.object({
    // Gemini API
    VITE_GEMINI_API_KEY: z.string().min(1, 'Gemini API 키가 필요합니다'),
    
    // Firebase (선택적 - 개발 모드에서는 없을 수 있음)
    VITE_FIREBASE_API_KEY: z.string().optional(),
    VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    VITE_FIREBASE_PROJECT_ID: z.string().optional(),
    VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
    VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
    VITE_FIREBASE_APP_ID: z.string().optional(),
    
    // 환경 모드
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    DEV: z.boolean().default(false),
    PROD: z.boolean().default(false),
});

/**
 * 환경 변수 타입
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 환경 변수 검증 및 반환
 * 개발 모드에서는 누락된 변수에 대해 경고만 출력
 */
export function getEnv(): Env {
    const rawEnv = {
        VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
    };

    // 개발 모드에서는 유연하게 처리
    if (import.meta.env.DEV) {
        const result = envSchema.safeParse(rawEnv);
        if (!result.success) {
            console.warn('⚠️ 환경 변수 검증 경고:', result.error.errors);
            // 개발 모드에서는 기본값으로 진행
            return {
                ...rawEnv,
                VITE_GEMINI_API_KEY: rawEnv.VITE_GEMINI_API_KEY || '',
            } as Env;
        }
        return result.data;
    }

    // 프로덕션 모드에서는 엄격하게 검증
    return envSchema.parse(rawEnv);
}

/**
 * 검증된 환경 변수
 */
export const env = getEnv();

