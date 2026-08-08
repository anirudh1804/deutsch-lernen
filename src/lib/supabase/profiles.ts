import { supabase } from './client';
import { User } from '@/features/auth/types';

export interface ProfileRow {
  id: string;
  username: string | null;
  email: string | null;
  preferred_language: 'de' | 'en';
  created_at: string;
}

export async function getOrCreateProfile(
  userId: string,
  opts: { username?: string; email?: string } = {}
): Promise<User | null> {
  const { username, email } = opts;

  // Try to fetch existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!fetchError && existing) {
    // Backfill email if it's currently missing
    if (email && !existing.email) {
      await supabase.from('profiles').update({ email }).eq('id', userId);
    }
    return mapProfileToUser(existing);
  }

  // Create profile if it doesn't exist
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: username || null,
      email: email || null,
      preferred_language: 'de',
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('Failed to create profile:', insertError.message);
    // If profile creation failed (e.g. RLS not set up yet), return a basic user
    return {
      id: userId,
      email: email || '',
      username,
      preferredLanguage: 'de',
    };
  }

  return created ? mapProfileToUser(created) : null;
}

// Resolve a username to its account email (for username-based login).
// Uses a SECURITY DEFINER RPC so unauthenticated users can look it up.
export async function findProfileEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('resolve_username_email', {
    username_arg: username,
  });
  if (error || !data) return null;
  return data as string;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<ProfileRow, 'username' | 'preferred_language'>>
): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) {
    throw new Error(error.message);
  }
}

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    email: profile.email || '',
    username: profile.username || undefined,
    preferredLanguage: profile.preferred_language,
    created_at: profile.created_at,
  };
}
