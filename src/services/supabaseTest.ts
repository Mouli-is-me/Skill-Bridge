import { isSupabaseConfigured } from '../lib/supabase';
import { getMachine, getMachineTelemetry } from './supabaseMachines';
import { subscribeToMachine, subscribeToTelemetry } from './supabaseRealtime';

/**
 * Development-only test function to verify Supabase database connection
 * and realtime subscriptions for machine M01 without altering existing UI or logic.
 */
let latestReceivedUpdateTimestamp: string | null = null;

export async function initSupabaseDevTest(): Promise<(() => void) | undefined> {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!isSupabaseConfigured) {
    console.info(
      '[Supabase Connection Diagnostic] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured in .env.local. Standby mode.'
    );
    return;
  }

  console.group('[Supabase Connection Diagnostic]');
  console.log('• Supabase Configuration:', 'ACTIVE');

  // 1. Initial Fetch Diagnostic
  const { data: machineData, error: machineError } = await getMachine('M01');
  if (machineError) {
    console.error('• Initial Fetch Status:', 'FAILED', `(Error: ${machineError.message})`);
    console.log('• M01 Row Returned:', null);
  } else {
    console.log('• Initial Fetch Status:', 'SUCCESS');
    console.log('• M01 Row Returned:', machineData);
    if (machineData?.updated_at || machineData?.last_seen) {
      latestReceivedUpdateTimestamp = machineData.updated_at || machineData.last_seen || null;
    }
  }

  // 2. Query Telemetry Diagnostic
  const { data: telemetryData, error: telemetryError } = await getMachineTelemetry('M01', 5);
  if (telemetryError) {
    console.warn('• Telemetry Query Status:', 'FAILED', `(Error: ${telemetryError.message})`);
  } else {
    console.log('• Telemetry Query Status:', 'SUCCESS', `(${telemetryData?.length || 0} rows)`);
  }

  console.log('• Realtime Subscription Status:', 'LISTENING');
  console.log('• Timestamp of Latest Received Update:', latestReceivedUpdateTimestamp || 'None yet');
  console.groupEnd();

  // 3. Subscribe to Realtime Updates
  const unsubscribeMachine = subscribeToMachine('M01', (updatedRow) => {
    latestReceivedUpdateTimestamp = new Date().toISOString();
    console.group('[Supabase Realtime Diagnostic Event]');
    console.log('• Event Type:', 'UPDATE');
    console.log('• Machine ID:', updatedRow.id);
    console.log('• M01 Row Received:', updatedRow);
    console.log('• Timestamp of Latest Update:', latestReceivedUpdateTimestamp);
    console.groupEnd();
  });

  const unsubscribeTelemetry = subscribeToTelemetry('M01', (newTelemetry) => {
    latestReceivedUpdateTimestamp = new Date().toISOString();
    console.log('[Supabase Realtime Telemetry Event]', {
      timestamp: latestReceivedUpdateTimestamp,
      telemetry: newTelemetry
    });
  });

  return () => {
    unsubscribeMachine();
    unsubscribeTelemetry();
    console.log('[Supabase Connection Diagnostic] Cleaned up realtime subscriptions.');
  };
}
