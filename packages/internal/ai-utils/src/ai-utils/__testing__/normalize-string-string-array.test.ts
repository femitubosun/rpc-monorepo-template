import { describe, expect, it } from 'vitest';
import { normalizeStringStringArray } from '../_helpers';

describe('NormalizeString/StringArray Test', () => {
  it('shold be defined', () => {
    expect(normalizeStringStringArray).toBeDefined();
  });

  it('should execute correctly', () => {
    const result = normalizeStringStringArray(['Test', 'Word']);
    expect(result).toBe('- Test\n- Word');
  });
});
