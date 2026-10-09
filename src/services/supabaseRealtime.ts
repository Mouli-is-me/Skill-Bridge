import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { SupabaseMachineRow, SupabaseTelemetryRow } from "./supabaseMachines";

type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";
type RealtimeListener = (payload: any) => void;

interface ActiveRealtimeChannel {
  channel: RealtimeChannel;
  listeners: Set<RealtimeListener>;
}

const activeChannels = new Map<string, ActiveRealtimeChannel>();

function subscribeToPostgresChanges(
  channelName: string,
  filter: {
    event: RealtimeEvent;
    schema: string;
    table: string;
    filter?: string;
  },
  listener: RealtimeListener,
  onStatus: (status: string, err?: Error) => void,
): () => void {
  let entry = activeChannels.get(channelName);

  if (!entry) {
    const channel = supabase.channel(channelName);
    entry = { channel, listeners: new Set() };
    activeChannels.set(channelName, entry);

    channel
      .on("postgres_changes", filter, (payload) => {
        entry?.listeners.forEach((activeListener) => activeListener(payload));
      })
      .subscribe(onStatus);
  }

  entry.listeners.add(listener);
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    entry?.listeners.delete(listener);

    if (entry && entry.listeners.size === 0) {
      activeChannels.delete(channelName);
      supabase.removeChannel(entry.channel);
    }
  };
}

/**
 * Subscribe to realtime database changes for all machines in `public.machines`.
 * Listens for INSERT, UPDATE, and DELETE events.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToAllMachines(
  callback: (payload: {
    eventType: string;
    new: SupabaseMachineRow | null;
    old: Partial<SupabaseMachineRow> | null;
  }) => void,
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channelName = "all-machines-realtime";
  return subscribeToPostgresChanges(
    channelName,
    { event: "*", schema: "public", table: "machines" },
    (payload) => {
      callback({
        eventType: payload.eventType,
        new: (payload.new as SupabaseMachineRow) || null,
        old: (payload.old as Partial<SupabaseMachineRow>) || null,
      });
    },
    (status, err) => {
      if (import.meta.env.DEV) {
        console.log(
          `[SupabaseRealtime] Channel '${channelName}' status:`,
          status,
        );
        if (err) {
          console.error(
            `[SupabaseRealtime] Channel '${channelName}' subscription error:`,
            err,
          );
        }
        if (status === "CHANNEL_ERROR") {
          console.warn(
            `[SupabaseRealtime] Warning: Channel error on public.machines. Ensure 'public.machines' is added to the Supabase Realtime publication (supabase_realtime) and RLS SELECT policy is enabled.`,
          );
        }
      }
    },
  );
}

/**
 * Subscribe to realtime database updates for a specific machine ID (e.g. "M01").
 * Listens for INSERT, UPDATE, and DELETE events filtered by id=eq.machineId.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToMachine(
  machineId: string,
  callback: (updatedRow: SupabaseMachineRow) => void,
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const cleanId = machineId.replace("-", "").toUpperCase();
  const channelName = `machine-realtime-${cleanId}`;

  return subscribeToPostgresChanges(
    channelName,
    { event: "*", schema: "public", table: "machines" },
    (payload) => {
      if (payload.new) {
        const row = payload.new as SupabaseMachineRow;
        const rowCleanId = (row.id || "").replace("-", "").toUpperCase();
        if (rowCleanId === cleanId) {
          if (import.meta.env.DEV) {
            console.log(
              `[SupabaseRealtime] Realtime event on '${channelName}' (Event ID/Timestamp: ${payload.commit_timestamp || payload.eventType || "UPDATE"}):`,
              row,
            );
          }
          callback(row);
        }
      }
    },
    (status, err) => {
      if (import.meta.env.DEV) {
        console.log(
          `[SupabaseRealtime] Machine channel '${channelName}' (${machineId}) status:`,
          status,
        );
        if (err) {
          console.error(
            `[SupabaseRealtime] Machine channel '${channelName}' error:`,
            err,
          );
        }
        if (status === "SUBSCRIBED") {
          console.log(
            `[SupabaseRealtime] Successfully subscribed to 'public.machines' realtime channel for ${machineId}`,
          );
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          console.warn(
            `[SupabaseRealtime] Channel status '${status}' for machine ${machineId}. Please verify Supabase publication includes 'public.machines' and RLS SELECT policy is enabled.`,
          );
        }
      }
    },
  );
}

/**
 * Subscribe to realtime telemetry insertions for a specific machine ID.
 * Returns a cleanup function that removes the Supabase channel.
 */
export function subscribeToTelemetry(
  machineId: string,
  callback: (newTelemetryRow: SupabaseTelemetryRow) => void,
): () => void {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const cleanId = machineId.replace("-", "");
  const channelName = `telemetry-realtime-${cleanId}`;

  return subscribeToPostgresChanges(
    channelName,
    {
      event: "INSERT",
      schema: "public",
      table: "telemetry",
      filter: `machine_id=eq.${machineId}`,
    },
    (payload) => {
      if (payload.new) {
        callback(payload.new as SupabaseTelemetryRow);
      }
    },
    (status, err) => {
      if (import.meta.env.DEV) {
        console.log(
          `[SupabaseRealtime] Telemetry channel '${channelName}' status:`,
          status,
        );
        if (err) {
          console.error(
            `[SupabaseRealtime] Telemetry channel '${channelName}' error:`,
            err,
          );
        }
      }
    },
  );
}
