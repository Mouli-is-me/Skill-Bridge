import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseMachineRow, SupabaseTelemetryRow } from './supabaseMachines';

/**
 * Subscribe to realtime database changes for all machines in `public.machines`.
 * Listens for INSERT, UPDATE, and DELETE events.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToAllMachines(
  callback: (payload: { eventType: string; new: SupabaseMachineRow | null; old: Partial<SupabaseMachineRow> | null }) => void
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel: RealtimeChannel = supabase
    .channel('all-machines-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'machines'
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: (payload.new as SupabaseMachineRow) || null,
          old: (payload.old as Partial<SupabaseMachineRow>) || null
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to realtime database updates for a specific machine ID (e.g. "M01").
 * Listens for INSERT, UPDATE, and DELETE events filtered by id=eq.machineId.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToMachine(
  machineId: string,
  callback: (updatedRow: SupabaseMachineRow) => void
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel: RealtimeChannel = supabase
    .channel(`machine-realtime-${machineId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'machines',
        filter: `id=eq.${machineId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as SupabaseMachineRow);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to realtime telemetry insertions for a specific machine ID.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToTelemetry(
  machineId: string,
  callback: (newTelemetryRow: SupabaseTelemetryRow) => void
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel: RealtimeChannel = supabase
    .channel(`telemetry-realtime-${machineId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'telemetry',
        filter: `machine_id=eq.${machineId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as SupabaseTelemetryRow);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
