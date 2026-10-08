import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Machine, MachineMetrics } from '../types/machine';

export interface SupabaseMachineRow {
  id: string;
  name: string;
  type: string;
  location?: string;
  section?: string;
  status: string;
  is_online: boolean;
  machine_state?: string;
  last_seen?: string | null;
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
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machineId)
      .single();

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
