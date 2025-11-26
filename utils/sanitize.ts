/**
 * 사용자 입력 Sanitization 유틸리티
 * XSS 공격 방지를 위한 입력 검증 및 정제
 * 
 * @module utils/sanitize
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * 사용자 입력을 sanitize하여 XSS 공격을 방지합니다.
 * 
 * @param input - 정제할 입력 문자열
 * @param options - Sanitization 옵션
 * @returns 정제된 문자열
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeInput(userInput);
 * // Returns: "Hello" (스크립트 태그 제거됨)
 * ```
 */
export const sanitizeInput = (
  input: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
  }
): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const sanitizeOptions = {
    ALLOWED_TAGS: options?.allowedTags || [],
    ALLOWED_ATTR: options?.allowedAttributes || [],
    KEEP_CONTENT: true, // 태그는 제거하되 내용은 유지
  };

  return DOMPurify.sanitize(input, sanitizeOptions);
};

/**
 * HTML 태그를 완전히 제거하고 텍스트만 반환합니다.
 * 
 * @param input - 정제할 입력 문자열
 * @returns HTML 태그가 제거된 순수 텍스트
 * 
 * @example
 * ```typescript
 * const html = '<p>Hello <strong>World</strong></p>';
 * const text = stripHtmlTags(html);
 * // Returns: "Hello World"
 * ```
 */
export const stripHtmlTags = (input: string): string => {
  return sanitizeInput(input, {
    allowedTags: [],
    allowedAttributes: [],
  });
};

/**
 * Markdown 스타일 텍스트를 안전하게 처리합니다.
 * 기본적인 마크다운은 허용하되, 스크립트는 차단합니다.
 * 
 * @param input - 정제할 마크다운 텍스트
 * @returns 정제된 마크다운 텍스트
 */
export const sanitizeMarkdown = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // 기본적인 마크다운 태그만 허용
  const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

