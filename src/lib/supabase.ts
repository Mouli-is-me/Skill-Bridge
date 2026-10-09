import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'YOUR_SUPABASE_PROJECT_URL' &&
  rawKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
);

const validUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey);

