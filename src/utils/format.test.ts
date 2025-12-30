import { describe, it, expect } from 'vitest';
import { formatDate, truncateText, generateSlug } from './format';

describe('formatDate', () => {
  it('should format a date correctly', () => {
    const date = new Date('2025-12-30');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/December/);
    expect(formatted).toMatch(/2025/);
  });
});

describe('truncateText', () => {
  it('should not truncate text shorter than maxLength', () => {
    const text = 'Hello World';
    expect(truncateText(text, 20)).toBe('Hello World');
  });

  it('should truncate text longer than maxLength', () => {
    const text = 'This is a very long text that needs to be truncated';
    const result = truncateText(text, 20);
    expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
    expect(result).toMatch(/\.\.\.$/);
  });

  it('should handle edge case with exact length', () => {
    const text = 'Exact';
    expect(truncateText(text, 5)).toBe('Exact');
  });
});

describe('generateSlug', () => {
  it('should convert text to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello! @World# $Test')).toBe('hello-world-test');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should create valid slug from complex title', () => {
    const title = 'Building a Modern Web App: A Guide (2025)';
    const slug = generateSlug(title);
    expect(slug).toBe('building-a-modern-web-app-a-guide-2025');
  });
});
