/**
 * 구조화된 로깅 시스템
 */

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

class Logger {
    private level: LogLevel;
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = import.meta.env.DEV;
        this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
    }

    /**
     * 디버그 로그 (개발 환경에서만)
     */
    debug(message: string, data?: unknown): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`, data);
        }
    }

    /**
     * 정보 로그
     */
    info(message: string, data?: unknown): void {
        if (this.level <= LogLevel.INFO) {
            console.info(`[INFO] ${message}`, data);
        }
    }

    /**
     * 경고 로그
     */
    warn(message: string, data?: unknown): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, data);
        }
    }

    /**
     * 에러 로그 (프로덕션에서도 출력)
     */
    error(message: string, error?: unknown, context?: Record<string, unknown>): void {
        if (this.level <= LogLevel.ERROR) {
            const errorInfo = {
                message,
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: this.isDevelopment ? error.stack : undefined,
                } : error,
                context,
                timestamp: new Date().toISOString(),
            };
            
            console.error(`[ERROR] ${message}`, errorInfo);
            
            // 프로덕션에서 Sentry에 전송
            if (!this.isDevelopment && typeof window !== 'undefined' && (window as any).Sentry) {
                try {
                    (window as any).Sentry.captureException(error, {
                        tags: context,
                        extra: { message, context },
                    });
                } catch (sentryError) {
                    // Sentry 전송 실패는 무시
                }
            }
        }
    }

    /**
     * 로그 레벨 설정
     */
    setLevel(level: LogLevel): void {
        this.level = level;
    }
}

export const logger = new Logger();

