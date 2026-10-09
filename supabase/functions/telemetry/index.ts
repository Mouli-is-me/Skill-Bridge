import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TelemetryRequestBody {
  machine_id?: string;
  device_id?: string;
  timestamp?: string | number;
  machine?: {
    state?: string;
    status?: string;
  };
  mpu6050?: {
    rms?: number;
    peak?: number;
    events?: number;
  };
  ds18b20?: {
    temperature?: number;
  };
  digital_vibration?: {
    state?: string;
  };
  // Flat fallback properties
  temperature?: number;
  rms_vibration?: number;
  peak_vibration?: number;
  vibration_events?: number;
  digital_vibration_state?: string;
  machine_state?: string;
  status?: string;
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Validate Request Method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method Not Allowed. Only POST requests are supported.",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // 3. Authenticate Device Token
    const deviceTokenHeader = req.headers.get("x-device-token");
    const expectedToken = Deno.env.get("DEVICE_TOKEN");

    if (!expectedToken) {
      console.error(
        "[Telemetry Edge Function] DEVICE_TOKEN secret is not configured on Supabase.",
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server misconfiguration: DEVICE_TOKEN secret missing.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!deviceTokenHeader || deviceTokenHeader !== expectedToken) {
      console.warn(
        "[Telemetry Edge Function] Unauthorized telemetry attempt. Invalid or missing x-device-token.",
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid or missing x-device-token header.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 4. Parse JSON Payload
    let body: TelemetryRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Extract and Normalize Payload Fields
    const machineId = body.machine_id;
    const deviceId = body.device_id;

    if (
      !machineId ||
      typeof machineId !== "string" ||
      machineId.trim() === ""
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Validation Error: machine_id is required and must be a non-empty string.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Validation Error: device_id is required and must be a non-empty string.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract sensor values (nested format prioritized, fallback to flat format)
    const temperature = body.ds18b20?.temperature ?? body.temperature;
    const rms = body.mpu6050?.rms ?? body.rms_vibration;
    const peak = body.mpu6050?.peak ?? body.peak_vibration;
    const events = body.mpu6050?.events ?? body.vibration_events;
    const digitalVibrationState =
      body.digital_vibration?.state ?? body.digital_vibration_state ?? "QUIET";
    const machineState = body.machine?.state ?? body.machine_state ?? "RUNNING";
    const status =
      body.machine?.status ??
      body.status ??
      (machineState === "FAULT" || machineState === "ABNORMAL"
        ? "WARNING"
        : "NORMAL");
    const timestampRaw = body.timestamp ?? new Date().toISOString();

    // 6. Validate Data Types & Ranges
    if (
      typeof temperature !== "number" ||
      Number.isNaN(temperature) ||
      temperature < -50 ||
      temperature > 200
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Validation Error: ds18b20.temperature must be a valid number between -50 and 200.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (typeof rms !== "number" || Number.isNaN(rms) || rms < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation Error: mpu6050.rms must be a non-negative number.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (typeof peak !== "number" || Number.isNaN(peak) || peak < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Validation Error: mpu6050.peak must be a non-negative number.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (typeof events !== "number" || Number.isNaN(events) || events < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Validation Error: mpu6050.events must be a non-negative number.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Convert timestamp to ISO string
    let formattedTimestamp: string;
    if (typeof timestampRaw === "number") {
      formattedTimestamp = new Date(
        timestampRaw > 1e11 ? timestampRaw : timestampRaw * 1000,
      ).toISOString();
    } else {
      formattedTimestamp = new Date(timestampRaw).toISOString();
    }

    // 7. Initialize Supabase Admin Client using Service Role Key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error(
        "[Telemetry Edge Function] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server misconfiguration: Supabase credentials missing.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 8. Insert Record into `public.telemetry`
    const telemetryRecord = {
      machine_id: machineId,
      device_id: deviceId,
      timestamp: formattedTimestamp,
      temperature,
    };

    const { data: telemetryData, error: telemetryError } = await supabaseAdmin
      .from("telemetry")
      .insert([telemetryRecord])
      .select();

    if (telemetryError) {
      console.error(
        "[Telemetry Edge Function] Error inserting into telemetry table:",
        telemetryError,
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database Insert Error: ${telemetryError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 9. Update `public.machines` Status and Metrics
    const nowIso = new Date().toISOString();
    const machineUpdatePayload = {
      status,
      machine_state: machineState,
      temperature,
      rms,
      peak,
      events,
      digital_vibration: digitalVibrationState,
      is_online: true,
      last_seen: nowIso,
      updated_at: nowIso,
    };

    // Update matching machine rows (handles both M01 and M-01 if configured)
    const cleanId = machineId.replace("-", "");
    const hyphenatedId =
      cleanId.length === 3
        ? `${cleanId.slice(0, 1)}-${cleanId.slice(1)}`
        : machineId;
    const machineIds = Array.from(new Set([machineId, cleanId, hyphenatedId]));

    const { data: machineData, error: machineError } = await supabaseAdmin
      .from("machines")
      .update(machineUpdatePayload)
      .in("id", machineIds)
      .select();

    if (machineError) {
      console.error(
        "[Telemetry Edge Function] Error updating machines table:",
        machineError,
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Machine Update Error: ${machineError.message}`,
          telemetryInserted: true,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!machineData || machineData.length === 0) {
      console.error(
        `[Telemetry Edge Function] No machine found for id ${machineId}.`,
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Machine Update Error: No machine found for id ${machineId}.`,
          telemetryInserted: true,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[Telemetry Edge Function] Telemetry recorded successfully for ${machineId} (${deviceId})`,
    );

    // 10. Return Success Response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Telemetry received and processed successfully.",
        data: {
          telemetry: telemetryData?.[0] ?? telemetryRecord,
          machine: machineData?.[0] ?? null,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(
      "[Telemetry Edge Function] Unexpected Server Error:",
      errorMsg,
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: `Internal Server Error: ${errorMsg}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
