// Resets the user_vocabulary table so every item starts from zero correct
// answers (useful for observing the repeat-to-learn (3x) system from scratch).
//
// Usage:
//   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
//      (Supabase Dashboard -> Project Settings -> API -> service_role)
//   2. node scripts/reset-vocab.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  try {
    const text = readFileSync('.env.local', 'utf-8');
    const vars = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/);
      if (m) vars[m[1]] = m[2];
    }
    return vars;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(), ...process.env };
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    'Missing credentials. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, then re-run.'
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { error } = await supabase.from('user_vocabulary').delete().neq('id', '00000000-0000-0000-0000-000000000000');

if (error) {
  console.error('Reset failed:', error.message);
  process.exit(1);
}
console.log('user_vocabulary table cleared.');
