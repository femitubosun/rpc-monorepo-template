import { describe, expect, it } from 'vitest';

describe('Environment Loading', () => {
  it('should load .env.test file', () => {
    expect(process.env.NODE_ENV).toBe('testing');
  });

  it('should load DATABASE_URL from .env.test', () => {
    expect(process.env.DATABASE_URL).toContain('axon_test');
  });

  it('should load PORT from .env.test', () => {
    expect(process.env.PORT).toBe('4000');
  });
});
