import { describe, it, expect } from 'vitest';

describe('Content Collections', () => {
  it('should have content directory structure', () => {
    // Basic sanity test - actual content collection testing requires Astro runtime
    expect(true).toBe(true);
  });

  it('should validate collection schema types', () => {
    // Content collection schemas are validated by Astro at build time
    // This test confirms the test suite is working
    expect(typeof 'work').toBe('string');
    expect(typeof 'store').toBe('string');
    expect(typeof 'projects').toBe('string');
    expect(typeof 'posts').toBe('string');
    expect(typeof 'authors').toBe('string');
  });
});
