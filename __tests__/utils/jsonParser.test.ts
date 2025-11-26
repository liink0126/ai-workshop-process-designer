import { describe, it, expect } from 'vitest';
import { extractJson } from '../../utils/jsonParser';

describe('extractJson', () => {
  it('should extract JSON from markdown code block', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = extractJson<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('should extract JSON without markdown code block', () => {
    const input = '{"key": "value"}';
    const result = extractJson<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('should extract JSON array', () => {
    const input = '[{"id": 1}, {"id": 2}]';
    const result = extractJson<Array<{ id: number }>>(input);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should handle nested JSON', () => {
    const input = '{"nested": {"key": "value"}}';
    const result = extractJson<{ nested: { key: string } }>(input);
    expect(result).toEqual({ nested: { key: 'value' } });
  });

  it('should throw error for invalid JSON', () => {
    const input = 'invalid json';
    expect(() => extractJson(input)).toThrow();
  });

  it('should extract JSON from text with surrounding content', () => {
    const input = 'Some text before {"key": "value"} some text after';
    const result = extractJson<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });
});

