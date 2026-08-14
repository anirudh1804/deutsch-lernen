import { supabase } from './client';

export const GUEST_ATTEMPT_LIMIT = 15;

/**
 * Fetches the number of free guest attempts already used for a guest user.
 * Returns 0 if no row exists yet or on error.
 */
export async function getGuestAttempts(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('guest_attempts')
    .select('attempts_used')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load guest attempts:', error.message);
    return 0;
  }
  return data?.attempts_used ?? 0;
}

/**
 * Atomically increments the guest attempt counter and returns the new total.
 * Returns null on failure.
 */
export async function incrementGuestAttempt(userId: string): Promise<number | null> {
  const { data, error } = await supabase.rpc('increment_guest_attempt', {
    user_id: userId,
  });
  if (error) {
    console.error('Failed to increment guest attempts:', error.message);
    return null;
  }
  return typeof data === 'number' ? data : null;
}

/** True when a guest has reached (or exceeded) the free-attempt limit. */
export function isGuestLimitReached(attemptsUsed: number, limit = GUEST_ATTEMPT_LIMIT): boolean {
  return attemptsUsed >= limit;
}