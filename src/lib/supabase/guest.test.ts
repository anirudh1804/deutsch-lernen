import { describe, it, expect } from 'vitest';
import { GUEST_ATTEMPT_LIMIT, isGuestLimitReached } from './guest';

describe('guest attempt limit', () => {
  it('allows play up to the limit (15 answers)', () => {
    expect(isGuestLimitReached(0)).toBe(false);
    expect(isGuestLimitReached(GUEST_ATTEMPT_LIMIT - 1)).toBe(false);
    expect(isGuestLimitReached(GUEST_ATTEMPT_LIMIT)).toBe(true);
  });

  it('treats the limit as reached once exceeded', () => {
    expect(isGuestLimitReached(GUEST_ATTEMPT_LIMIT + 1)).toBe(true);
    expect(isGuestLimitReached(GUEST_ATTEMPT_LIMIT + 10)).toBe(true);
  });
});