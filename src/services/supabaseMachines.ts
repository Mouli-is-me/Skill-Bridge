import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Machine, MachineMetrics } from '../types/machine';
import { useMachineStore } from '../store/machineStore';
import { createDefaultModulesForMachine } from '../utils/moduleHelpers';
import { subscribeToMachine, subscribeToTelemetry } from './supabaseRealtime';

export interface SupabaseMachineRow {
  id: string;
  name?: string;
  type?: string;
  location?: string;
  section?: string;
  status: string;
  is_online: boolean;
  machine_state?: string;
  last_seen?: string | null;
  temperature?: number;
  rms?: number;
  peak?: number;
  events?: number;
  digital_vibration?: string;
  score?: number;
  metrics?: Record<string, any>;
  model?: string;
  installed_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseTelemetryRow {
  id?: string | number;
  machine_id: string;
  device_id?: string;
  timestamp: string | number;
  temperature?: number;
  rms_vibration?: number;
  peak_vibration?: number;
  vibration_events?: number;
  digital_vibration_state?: string;
  machine_state?: string;
  score?: number;
  created_at?: string;
  raw_payload?: Record<string, any>;
}

/**
 * Fetch all machines from Supabase `machines` table.
 */
export async function getMachines(): Promise<{ data: SupabaseMachineRow[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured with valid environment variables.') };
  }

  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('id');

    if (error) {
      console.error('[SupabaseMachines] Error fetching machines:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[SupabaseMachines] Unexpected error in getMachines:', error);
    return { data: null, error };
  }
}

/**
 * Fetch a single machine by ID from Supabase `machines` table.
 */
export async function getMachine(machineId: string): Promise<{ data: SupabaseMachineRow | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured with valid environment variables.') };
  }

  try {
    const cleanId = machineId.replace('-', '');
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .or(`id.eq.${machineId},id.eq.${cleanId}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`[SupabaseMachines] Error fetching machine ${machineId}:`, error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[SupabaseMachines] Unexpected error in getMachine(${machineId}):`, error);
    return { data: null, error };
  }
}

/**
 * Fetch latest telemetry rows for a specific machine from Supabase `telemetry` table.
 */
export async function getMachineTelemetry(
  machineId: string,
  limit: number = 50
): Promise<{ data: SupabaseTelemetryRow[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured with valid environment variables.') };
  }

  try {
    const { data, error } = await supabase
      .from('telemetry')
      .select('*')
      .eq('machine_id', machineId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`[SupabaseMachines] Error fetching telemetry for ${machineId}:`, error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[SupabaseMachines] Unexpected error in getMachineTelemetry(${machineId}):`, error);
    return { data: null, error };
  }
}

/**
 * Maps a Supabase `machines` database row directly into the Zustand `useMachineStore`.
 * Preserves the existing UI model while serving as the single source of truth for M01.
 */
export function applySupabaseMachineRowToStore(row: SupabaseMachineRow): void {
  const { machines, setMachines } = useMachineStore.getState();
  const isOnline = Boolean(row.is_online);

  // Map status string
  let mappedStatus: Machine['status'] = (row.status as Machine['status']) || 'RUNNING';
  if (!isOnline || row.status === 'OFFLINE') {
    mappedStatus = 'OFFLINE';
  }

  const machineState = row.machine_state || (isOnline ? 'RUNNING' : 'OFFLINE');
  const score = typeof row.score === 'number'
    ? row.score
    : (isOnline ? (row.status === 'NORMAL' || row.status === 'RUNNING' ? 95 : 75) : 0);

  const lastSeen = row.last_seen || null;
  const lastSeenSecondsAgo = lastSeen
    ? Math.max(0, Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000))
    : null;

  // Telemetry metrics from columns or fallback nested jsonb
  const tempVal = typeof row.temperature === 'number'
    ? row.temperature
    : (row.metrics?.temperature ?? (isOnline ? 31.5 : 0));

  const rmsVal = typeof row.rms === 'number'
    ? row.rms
    : (row.metrics?.rmsVibration ?? row.metrics?.vibration ?? (isOnline ? 0.123 : 0));

  const peakVal = typeof row.peak === 'number'
    ? row.peak
    : (row.metrics?.peakVibration ?? (isOnline ? 0.421 : 0));

  const eventsVal = typeof row.events === 'number'
    ? row.events
    : (row.metrics?.vibrationEvents ?? 0);

  const digitalState = (row.digital_vibration || row.metrics?.digitalVibrationState || 'QUIET') as 'QUIET' | 'ACTIVE';

  const updatedMachines = machines.map((m) => {
    const isTarget = m.id === row.id || m.id.replace('-', '') === row.id.replace('-', '');
    if (isTarget) {
      const updatedModules = createDefaultModulesForMachine(
        m.id,
        row.name || m.name,
        m.type,
        {
          rpm: isOnline ? (m.metrics.rpm || 850) : 0,
          temperature: tempVal,
          vibration: rmsVal,
          current: isOnline ? (m.metrics.current || 18.5) : 0,
          utilization: isOnline ? (m.metrics.utilization || 92) : 0,
          production: isOnline ? (m.metrics.production || 85) : 0,
          oee: isOnline ? (m.metrics.oee || score) : score,
          rmsVibration: rmsVal,
          peakVibration: peakVal,
          vibrationEvents: eventsVal,
          digitalVibrationState: digitalState,
          machineState: machineState,
          score: score
        },
        m.thresholds,
        isOnline
      );

      return {
        ...m,
        name: row.name || m.name,
        status: mappedStatus,
        isOnline: isOnline,
        lastUpdated: row.updated_at || row.last_seen || new Date().toISOString(),
        hardwareState: {
          espConnected: isOnline,
          backendConnected: m.hardwareState?.backendConnected ?? true,
          lastSeenSecondsAgo: lastSeenSecondsAgo
        },
        metrics: {
          ...m.metrics,
          rpm: isOnline ? (m.metrics.rpm || 850) : 0,
          temperature: tempVal,
          vibration: rmsVal,
          rmsVibration: rmsVal,
          peakVibration: peakVal,
          vibrationEvents: eventsVal,
          digitalVibrationState: digitalState,
          machineState: machineState,
          score: score,
          oee: isOnline ? (m.metrics.oee || score) : score
        },
        modules: updatedModules
      };
    }
    return m;
  });

  setMachines(updatedMachines);
}

/**
 * Initializes live Supabase synchronization and Realtime subscriptions for M01.
 */
export async function initSupabaseMachineSync(): Promise<() => void> {
  if (!isSupabaseConfigured) {
    console.info('[SupabaseSync] Credentials not configured in .env.local — skipping live Supabase sync.');
    return () => {};
  }

  console.log('[SupabaseSync] Initializing Supabase sync for M01...');

  // 1. Initial Fetch for M01 / M-01
  const { data, error } = await getMachine('M01');
  if (error || !data) {
    const { data: dataAlt } = await getMachine('M-01');
    if (dataAlt) {
      console.log('[SupabaseSync] M-01 loaded from Supabase:', dataAlt);
      applySupabaseMachineRowToStore(dataAlt);
    } else {
      console.warn('[SupabaseSync] Could not fetch M01 from Supabase:', error?.message);
    }
  } else if (data) {
    console.log('[SupabaseSync] M01 loaded from Supabase:', data);
    applySupabaseMachineRowToStore(data);
  }

  // 2. Realtime Subscriptions for M01
  const unsubM01 = subscribeToMachine('M01', (updatedRow) => {
    console.log('[SupabaseSync] Realtime update for M01:', updatedRow);
    applySupabaseMachineRowToStore(updatedRow);
  });

  const unsubM01Alt = subscribeToMachine('M-01', (updatedRow) => {
    console.log('[SupabaseSync] Realtime update for M-01:', updatedRow);
    applySupabaseMachineRowToStore(updatedRow);
  });

  const unsubTelemetry = subscribeToTelemetry('M01', (newTelemetry) => {
    console.log('[SupabaseSync] Realtime telemetry inserted for M01:', newTelemetry);
    if (newTelemetry) {
      applySupabaseMachineRowToStore({
        id: 'M01',
        status: newTelemetry.machine_state === 'ABNORMAL' ? 'FAULT' : 'RUNNING',
        is_online: true,
        machine_state: newTelemetry.machine_state || 'RUNNING',
        temperature: newTelemetry.temperature,
        rms: newTelemetry.rms_vibration,
        peak: newTelemetry.peak_vibration,
        events: newTelemetry.vibration_events,
        digital_vibration: newTelemetry.digital_vibration_state,
        score: newTelemetry.score,
        last_seen: new Date().toISOString()
      });
    }
  });

  return () => {
    unsubM01();
    unsubM01Alt();
    unsubTelemetry();
    console.log('[SupabaseSync] Cleaned up M01 realtime subscriptions.');
  };
}
