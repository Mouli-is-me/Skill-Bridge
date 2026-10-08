import React, { useState } from "react";
import { useUIStore } from "../store/uiStore";
import { useSimulationStore } from "../store/simulationStore";
import { useMachineStore } from "../store/machineStore";
import { Button } from "../components/ui/Button";
import {
  Sun,
  Moon,
  RefreshCw,
  Check,
} from "lucide-react";
import { clsx } from "clsx";

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const {
    isSimulating,
    toggleSimulation,
  } = useSimulationStore();
  const { resetAll } = useMachineStore();

  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [vibUnit, setVibUnit] = useState<"mms" | "g">("mms");
  const [telemetrySource, setTelemetrySource] = useState<
    "simulator" | "websocket" | "esp32"
  >("simulator");
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSaveSettings = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="bg-surface border border-surface-border p-3.5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-txt-primary tracking-tight font-mono">
            PLATFORM SETTINGS
          </h2>
          <p className="text-[11px] text-txt-secondary font-mono">
            Theme preferences, unit standards, and telemetry connection parameters
          </p>
        </div>

        {savedBanner && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xs text-xs font-mono flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* 1. Theme & Appearance */}
      <div className="bg-surface border border-surface-border rounded-md p-4 space-y-3">
        <div className="border-b border-surface-border pb-2">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Theme & Appearance
          </h3>
          <p className="text-[11px] text-txt-secondary font-mono">
            Industrial high-contrast or dark control room theme
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={clsx(
              "p-3 rounded-xs border text-left flex items-center justify-between transition-all",
              theme === "light"
                ? "border-accent bg-accent/5"
                : "border-surface-border bg-bg-primary/50 hover:bg-surface-hover",
            )}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-txt-primary block">
                  Light Mode
                </span>
                <span className="text-[10px] text-txt-muted">
                  High contrast factory floor layout
                </span>
              </div>
            </div>
            {theme === "light" && <Check className="w-3.5 h-3.5 text-accent" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={clsx(
              "p-3 rounded-xs border text-left flex items-center justify-between transition-all",
              theme === "dark"
                ? "border-accent bg-accent/5"
                : "border-surface-border bg-bg-primary/50 hover:bg-surface-hover",
            )}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-txt-primary block">
                  Dark Mode
                </span>
                <span className="text-[10px] text-txt-muted">
                  Low fatigue control room layout
                </span>
              </div>
            </div>
            {theme === "dark" && <Check className="w-3.5 h-3.5 text-accent" />}
          </button>
        </div>
      </div>

      {/* 2. Telemetry Data Source */}
      <div className="bg-surface border border-surface-border rounded-md p-4 space-y-3">
        <div className="border-b border-surface-border pb-2">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Telemetry & Data Source (ESP32 Integration Layer)
          </h3>
          <p className="text-[11px] text-txt-secondary font-mono">
            Data pipeline source configuration
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          <div
            onClick={() => setTelemetrySource("simulator")}
            className={clsx(
              "p-3 rounded-xs border cursor-pointer transition-all select-none",
              telemetrySource === "simulator"
                ? "border-accent bg-accent/5"
                : "border-surface-border bg-bg-primary/50 hover:bg-surface-hover",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">
                Live Simulator
              </span>
              {telemetrySource === "simulator" && (
                <Check className="w-3.5 h-3.5 text-accent" />
              )}
            </div>
            <p className="text-[10px] text-txt-muted">
              Physics simulation ticker
            </p>
          </div>

          <div
            onClick={() => setTelemetrySource("websocket")}
            className={clsx(
              "p-3 rounded-xs border cursor-pointer transition-all select-none",
              telemetrySource === "websocket"
                ? "border-accent bg-accent/5"
                : "border-surface-border bg-bg-primary/50 hover:bg-surface-hover",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">
                Backend WebSocket
              </span>
              {telemetrySource === "websocket" && (
                <Check className="w-3.5 h-3.5 text-accent" />
              )}
            </div>
            <p className="text-[10px] text-txt-muted">
              FastAPI WebSocket stream
            </p>
          </div>

          <div
            onClick={() => setTelemetrySource("esp32")}
            className={clsx(
              "p-3 rounded-xs border cursor-pointer transition-all select-none",
              telemetrySource === "esp32"
                ? "border-accent bg-accent/5"
                : "border-surface-border bg-bg-primary/50 hover:bg-surface-hover",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">
                ESP32 Hardware
              </span>
              {telemetrySource === "esp32" && (
                <Check className="w-3.5 h-3.5 text-accent" />
              )}
            </div>
            <p className="text-[10px] text-txt-muted">
              Direct physical node stream
            </p>
          </div>
        </div>

        {/* Stream Control */}
        <div className="flex items-center justify-between pt-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-txt-secondary">Stream Status:</span>
            <span
              className={clsx(
                "font-bold",
                isSimulating ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {isSimulating ? "● ACTIVE" : "○ PAUSED"}
            </span>
          </div>

          <Button size="sm" variant="outline" onClick={toggleSimulation}>
            {isSimulating ? "Pause Stream" : "Resume Stream"}
          </Button>
        </div>
      </div>

      {/* 3. Measurement Units */}
      <div className="bg-surface border border-surface-border rounded-md p-4 space-y-3">
        <div className="border-b border-surface-border pb-2">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Engineering Units
          </h3>
          <p className="text-[11px] text-txt-secondary font-mono">
            Display units for telemetry parameters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-txt-secondary font-semibold uppercase text-[10px] block mb-1">
              Temperature
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTempUnit("C")}
                className={clsx(
                  "flex-1 py-1.5 rounded-xs border text-xs font-bold transition-colors",
                  tempUnit === "C"
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-primary text-txt-secondary border-surface-border",
                )}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit("F")}
                className={clsx(
                  "flex-1 py-1.5 rounded-xs border text-xs font-bold transition-colors",
                  tempUnit === "F"
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-primary text-txt-secondary border-surface-border",
                )}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="text-txt-secondary font-semibold uppercase text-[10px] block mb-1">
              Vibration Velocity
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVibUnit("mms")}
                className={clsx(
                  "flex-1 py-1.5 rounded-xs border text-xs font-bold transition-colors",
                  vibUnit === "mms"
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-primary text-txt-secondary border-surface-border",
                )}
              >
                Velocity (mm/s)
              </button>
              <button
                type="button"
                onClick={() => setVibUnit("g")}
                className={clsx(
                  "flex-1 py-1.5 rounded-xs border text-xs font-bold transition-colors",
                  vibUnit === "g"
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-primary text-txt-secondary border-surface-border",
                )}
              >
                Acceleration (g)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Factory Reset */}
      <div className="bg-surface border border-surface-border rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div>
          <span className="font-bold text-txt-primary block">
            Factory Telemetry Reset
          </span>
          <span className="text-[10px] text-txt-muted">
            Reset baseline telemetry readings and thresholds to defaults
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetAll}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Baseline
          </Button>

          <Button size="sm" variant="primary" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
