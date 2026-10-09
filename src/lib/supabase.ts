import { createClient } from '@supabase/supabase-js';

function cleanEnvVar(val?: string): string {
  if (!val) return '';
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

const rawUrl = cleanEnvVar(import.meta.env.VITE_SUPABASE_URL);
const rawKey = cleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabaseUrl = rawUrl
  ? (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`)
  : '';

export const supabaseAnonKey = rawKey;

const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_PROJECT_URL') || supabaseUrl.includes('placeholder-project');
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY') || supabaseAnonKey.includes('placeholder-anon-key');

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;

export function getSupabaseConfigDiagnostics(): {
  isConfigured: boolean;
  urlPresent: boolean;
  keyPresent: boolean;
  reason?: string;
} {
  if (!rawUrl && !rawKey) {
    return {
      isConfigured: false,
      urlPresent: false,
      keyPresent: false,
      reason: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing from import.meta.env.'
    };
  }
  if (!rawUrl) {
    return {
      isConfigured: false,
      urlPresent: false,
      keyPresent: true,
      reason: 'VITE_SUPABASE_URL is missing from import.meta.env.'
    };
  }
  if (!rawKey) {
    return {
      isConfigured: false,
      urlPresent: true,
      keyPresent: false,
      reason: 'VITE_SUPABASE_ANON_KEY is missing from import.meta.env.'
    };
  }
  if (isPlaceholderUrl) {
    return {
      isConfigured: false,
      urlPresent: true,
      keyPresent: true,
      reason: 'VITE_SUPABASE_URL is set to a placeholder value ("YOUR_SUPABASE_PROJECT_URL").'
    };
  }
  if (isPlaceholderKey) {
    return {
      isConfigured: false,
      urlPresent: true,
      keyPresent: true,
      reason: 'VITE_SUPABASE_ANON_KEY is set to a placeholder value ("YOUR_SUPABASE_ANON_KEY").'
    };
  }
  return {
    isConfigured: true,
    urlPresent: true,
    keyPresent: true
  };
}

const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey);


