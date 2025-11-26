// 에러 처리 유틸리티
import { logger } from './logger';

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  message: string;
  code: ErrorCode;
  userFriendlyMessage: string;
  originalError?: unknown;
}

/**
 * AppError 클래스
 * 구조화된 에러 처리를 위한 클래스
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    public userFriendlyMessage: string = message,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 서비스 에러를 처리하고 AppError로 변환
 * 
 * @param error - 발생한 에러
 * @param context - 에러 발생 컨텍스트 (예: "워크숍 생성", "API 호출")
 * @returns AppError 인스턴스
 * 
 * @example
 * ```typescript
 * try {
 *   await someService();
 * } catch (error) {
 *   throw handleServiceError(error, '워크숍 생성');
 * }
 * ```
 */
export const handleServiceError = (error: unknown, context: string): AppError => {
  const originalError = error;
  const errorMessage = getErrorMessage(error);
  
  // Sentry에 에러 전송 (프로덕션)
  if (import.meta.env.PROD) {
    // Sentry.captureException(error, { tags: { context } });
  }
  
  return new AppError(
    `${context}: ${errorMessage}`,
    ErrorCode.API_ERROR,
    `${context}에 실패했습니다. 잠시 후 다시 시도해 주세요.`,
    originalError
  );
};

export class WorkshopGenerationError extends Error {
  constructor(
    message: string, 
    public code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'WorkshopGenerationError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof WorkshopGenerationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 네트워크 에러
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.';
    }
    
    // API 에러
    if (message.includes('api') || message.includes('key') || message.includes('unauthorized')) {
      return 'AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    }
    
    // JSON 파싱 에러
    if (message.includes('json') || message.includes('parse') || message.includes('syntax')) {
      return 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.';
    }
    
    // Firebase 에러
    if (message.includes('firebase') || message.includes('auth') || message.includes('permission')) {
      return '인증 또는 저장 중 오류가 발생했습니다. 다시 시도해 주세요.';
    }
    
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
};

export const createError = (error: unknown, defaultMessage?: string): WorkshopGenerationError => {
  if (error instanceof WorkshopGenerationError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : String(error);
  const errorMessage = defaultMessage || getErrorMessage(error);
  
  let code = ErrorCode.UNKNOWN_ERROR;
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    code = ErrorCode.NETWORK_ERROR;
  } else if (lowerMessage.includes('api') || lowerMessage.includes('key')) {
    code = ErrorCode.API_ERROR;
  } else if (lowerMessage.includes('json') || lowerMessage.includes('parse')) {
    code = ErrorCode.JSON_PARSE_ERROR;
  } else if (lowerMessage.includes('firebase') || lowerMessage.includes('auth')) {
    code = ErrorCode.FIREBASE_ERROR;
  }
  
  return new WorkshopGenerationError(errorMessage, code, error);
};

export const handleApiError = (error: unknown): never => {
  const workshopError = createError(error);
  logger.error('API Error', error);
  throw workshopError;
};

