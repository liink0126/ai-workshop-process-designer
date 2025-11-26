/**
 * JSON 파싱 유틸리티
 * 
 * AI 응답에서 JSON을 추출하고 파싱합니다.
 * Markdown 코드 블록이나 일반 텍스트에서 JSON을 안전하게 추출합니다.
 * 
 * @module utils/jsonParser
 */

export interface JsonParseError extends Error {
    name: 'JsonParseError';
    rawText: string;
}

/**
 * Extracts a JSON object from a string that might be wrapped in markdown code blocks
 * or have other text around it.
 * 
 * @param text The raw text from the AI model.
 * @returns The parsed JSON object.
 * @throws {JsonParseError} If parsing fails.
 * 
 * @example
 * ```typescript
 * const json = extractJson<{ key: string }>('```json\n{"key": "value"}\n```');
 * // Returns: { key: "value" }
 * ```
 */
export function extractJson<T = unknown>(text: string): T {
    if (!text || typeof text !== 'string') {
        throw createJsonParseError('입력 텍스트가 유효하지 않습니다.', text);
    }

    let jsonText = text.trim();
    
    // Markdown 코드 블록에서 JSON 추출
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1].trim();
    } else {
        // 코드 블록이 없으면 첫 번째 { 부터 마지막 } 까지 추출
        const firstBrace = jsonText.indexOf('{');
        const firstBracket = jsonText.indexOf('[');
        
        let startIndex = -1;
        let endChar = '';
        
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIndex = firstBrace;
            endChar = '}';
        } else if (firstBracket !== -1) {
            startIndex = firstBracket;
            endChar = ']';
        }
        
        if (startIndex !== -1) {
            const endIndex = jsonText.lastIndexOf(endChar);
            if (endIndex !== -1 && endIndex > startIndex) {
                jsonText = jsonText.substring(startIndex, endIndex + 1);
            }
        }
    }

    // 빈 문자열 체크
    if (!jsonText || jsonText.trim().length === 0) {
        throw createJsonParseError('JSON 데이터를 찾을 수 없습니다.', text);
    }

    try {
        return JSON.parse(jsonText) as T;
    } catch (parseError) {
        // 파싱 실패 시 더 자세한 에러 정보 제공
        const error = parseError as Error;
        throw createJsonParseError(
            `JSON 파싱에 실패했습니다: ${error.message}`,
            jsonText,
            error
        );
    }
}

/**
 * JSON 파싱 에러 생성
 */
function createJsonParseError(
    message: string,
    rawText: string,
    originalError?: unknown
): JsonParseError {
    const error = new Error(message) as JsonParseError;
    error.name = 'JsonParseError';
    error.rawText = rawText;
    if (originalError) {
        error.cause = originalError;
    }
    return error;
}

