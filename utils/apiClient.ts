/**
 * API 호출 최적화 유틸리티
 * 
 * 재시도, 타임아웃, 요청 취소 기능을 제공하는 API 클라이언트입니다.
 * 
 * @module utils/apiClient
 * 
 * @example
 * ```typescript
 * const result = await apiClient.request(
 *   'unique-key',
 *   async (signal) => {
 *     return await fetch('/api/data', { signal });
 *   },
 *   { retry: 2, timeout: 5000 }
 * );
 * ```
 */

import { logger } from './logger';

interface ApiRequestOptions {
    retry?: number; // 재시도 횟수
    timeout?: number; // 타임아웃 (ms)
    retryDelay?: number; // 재시도 간격 (ms)
}

class ApiClient {
    private abortControllers = new Map<string, AbortController>();
    private readonly DEFAULT_TIMEOUT = 120000; // 2분
    private readonly DEFAULT_RETRY_DELAY = 1000; // 1초

    /**
     * API 요청을 실행합니다.
     * 
     * @param key - 요청을 식별하는 고유 키
     * @param requestFn - 실제 API 호출 함수
     * @param options - 옵션 (재시도, 타임아웃 등)
     * @returns API 응답
     */
    async request<T>(
        key: string,
        requestFn: (signal: AbortSignal) => Promise<T>,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        // 이전 요청 취소
        this.abortControllers.get(key)?.abort();
        
        const controller = new AbortController();
        this.abortControllers.set(key, controller);
        
        const timeout = options.timeout || this.DEFAULT_TIMEOUT;
        const retryCount = options.retry || 0;
        const retryDelay = options.retryDelay || this.DEFAULT_RETRY_DELAY;

        try {
            // 타임아웃 설정
            const timeoutId = setTimeout(() => {
                controller.abort();
                logger.warn(`API 요청 타임아웃: ${key}`, { timeout });
            }, timeout);

            const result = await this.retry(
                () => requestFn(controller.signal),
                retryCount,
                retryDelay,
                key
            );

            clearTimeout(timeoutId);
            return result;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('요청이 취소되었습니다.');
            }
            throw error;
        } finally {
            this.abortControllers.delete(key);
        }
    }

    /**
     * 재시도 로직
     */
    private async retry<T>(
        fn: () => Promise<T>,
        count: number,
        delay: number,
        key: string
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 0; attempt <= count; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // 재시도 가능한 에러인지 확인
                if (!this.isRetryableError(error)) {
                    throw error;
                }

                // 마지막 시도가 아니면 재시도
                if (attempt < count) {
                    logger.debug(`API 재시도: ${key} (${attempt + 1}/${count})`, { error });
                    await this.delay(delay * (attempt + 1)); // 지수 백오프
                }
            }
        }

        throw lastError;
    }

    /**
     * 재시도 가능한 에러인지 확인
     */
    private isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            // 네트워크 에러, 타임아웃, 5xx 서버 에러는 재시도 가능
            return (
                message.includes('network') ||
                message.includes('timeout') ||
                message.includes('fetch') ||
                message.includes('500') ||
                message.includes('502') ||
                message.includes('503') ||
                message.includes('504')
            );
        }
        return false;
    }

    /**
     * 지연 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 특정 키의 요청 취소
     */
    cancel(key: string): void {
        this.abortControllers.get(key)?.abort();
        this.abortControllers.delete(key);
    }

    /**
     * 모든 요청 취소
     */
    cancelAll(): void {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }
}

export const apiClient = new ApiClient();

