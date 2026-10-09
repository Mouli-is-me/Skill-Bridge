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

  const channelName = 'all-machines-realtime';
  const channel: RealtimeChannel = supabase
    .channel(channelName)
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
    .subscribe((status, err) => {
      if (import.meta.env.DEV) {
        console.log(`[SupabaseRealtime] Channel '${channelName}' status:`, status);
        if (err) {
          console.error(`[SupabaseRealtime] Channel '${channelName}' subscription error:`, err);
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn(
            `[SupabaseRealtime] Warning: Channel error on public.machines. Ensure 'public.machines' is added to the Supabase Realtime publication (supabase_realtime) and RLS SELECT policy is enabled.`
          );
        }
      }
    });

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

  const cleanId = machineId.replace('-', '').toUpperCase();
  const channelName = `machine-realtime-${cleanId}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'machines'
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new as SupabaseMachineRow;
          const rowCleanId = (row.id || '').replace('-', '').toUpperCase();
          if (rowCleanId === cleanId) {
            callback(row);
          }
        }
      }
    )
    .subscribe((status, err) => {
      if (import.meta.env.DEV) {
        console.log(`[SupabaseRealtime] Machine channel '${channelName}' (${machineId}) status:`, status);
        if (err) {
          console.error(`[SupabaseRealtime] Machine channel '${channelName}' error:`, err);
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn(
            `[SupabaseRealtime] Channel error for machine ${machineId}. Please verify Supabase publication contains 'public.machines' and RLS permits read access.`
          );
        }
      }
    });

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

  const cleanId = machineId.replace('-', '');
  const channelName = `telemetry-realtime-${cleanId}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
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
    .subscribe((status, err) => {
      if (import.meta.env.DEV) {
        console.log(`[SupabaseRealtime] Telemetry channel '${channelName}' status:`, status);
        if (err) {
          console.error(`[SupabaseRealtime] Telemetry channel '${channelName}' error:`, err);
        }
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
