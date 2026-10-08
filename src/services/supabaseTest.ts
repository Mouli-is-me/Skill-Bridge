import { isSupabaseConfigured } from '../lib/supabase';
import { getMachine, getMachineTelemetry } from './supabaseMachines';
import { subscribeToMachine, subscribeToTelemetry } from './supabaseRealtime';

/**
 * Development-only test function to verify Supabase database connection
 * and realtime subscriptions for machine M01 without altering existing UI or logic.
 */
export async function initSupabaseDevTest(): Promise<(() => void) | undefined> {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!isSupabaseConfigured) {
    console.info(
      '[Supabase Dev Test] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are using placeholders or not configured in .env.local. Realtime testing standby.'
    );
    return;
  }

  console.log('[Supabase Dev Test] Initializing connection test for machine M01...');

  // 1. Query M01 machine record
  const { data: machineData, error: machineError } = await getMachine('M01');
  if (machineError) {
    console.warn('[Supabase Dev Test] M01 Query Result (Error):', machineError.message);
  } else {
    console.log('[Supabase Dev Test] M01 Query Result (Success):', machineData);
  }

  // 2. Query recent telemetry
  const { data: telemetryData, error: telemetryError } = await getMachineTelemetry('M01', 5);
  if (telemetryError) {
    console.warn('[Supabase Dev Test] M01 Telemetry Query Result (Error):', telemetryError.message);
  } else {
    console.log('[Supabase Dev Test] M01 Recent Telemetry (Success):', telemetryData);
  }

  // 3. Subscribe to M01 Realtime Machine Updates
  const unsubscribeMachine = subscribeToMachine('M01', (updatedRow) => {
    console.log('[Supabase Dev Test] Realtime M01 Machine Update Received:', updatedRow);
  });

  // 4. Subscribe to M01 Realtime Telemetry Insertions
  const unsubscribeTelemetry = subscribeToTelemetry('M01', (newTelemetry) => {
    console.log('[Supabase Dev Test] Realtime M01 Telemetry Inserted:', newTelemetry);
  });

  // Return cleanup
  return () => {
    unsubscribeMachine();
    unsubscribeTelemetry();
    console.log('[Supabase Dev Test] Cleaned up realtime subscriptions.');
  };
}
