import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { useSimulationStore } from '../store/simulationStore';
import { useMachineStore } from '../store/machineStore';
import { Button } from '../components/ui/Button';
import { Sun, Moon, RefreshCw, Wifi, Check, Sliders, Database, Monitor } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const { isSimulating, toggleSimulation, connectionStatus, setConnectionStatus } = useSimulationStore();
  const { resetAll } = useMachineStore();

  const [refreshRate, setRefreshRate] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [vibUnit, setVibUnit] = useState<'mms' | 'g'>('mms');
  const [telemetrySource, setTelemetrySource] = useState<'simulator' | 'websocket' | 'esp32'>('simulator');
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSaveSettings = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-surface border border-surface-border p-4 rounded-lg shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-txt-primary tracking-tight font-mono">
            SYSTEM SETTINGS
          </h2>
          <p className="text-xs text-txt-secondary font-mono">
            Application preferences, display units, and telemetry connection configuration
          </p>
        </div>

        {savedBanner && (
          <div className="bg-status-healthy-bg border border-status-healthy-border text-status-healthy px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* 1. Theme & Appearance */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="border-b border-surface-border/60 pb-2.5">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Theme & Appearance
          </h3>
          <p className="text-xs text-txt-secondary font-mono">
            Select industrial light or dark contrast theme
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={clsx(
              "p-3 rounded-lg border text-left flex items-center justify-between transition-all",
              theme === 'light'
                ? "border-accent bg-accent-subtle/40 ring-1 ring-accent"
                : "border-surface-border bg-bg-primary hover:border-txt-muted/50"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-txt-primary block">Light Mode</span>
                <span className="text-[10px] text-txt-muted">High contrast factory floor aesthetic</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-accent" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={clsx(
              "p-3 rounded-lg border text-left flex items-center justify-between transition-all",
              theme === 'dark'
                ? "border-accent bg-accent-subtle/40 ring-1 ring-accent"
                : "border-surface-border bg-bg-primary hover:border-txt-muted/50"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-txt-primary block">Dark Mode</span>
                <span className="text-[10px] text-txt-muted">Low fatigue control room aesthetic</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-accent" />}
          </button>
        </div>
      </div>

      {/* 2. Telemetry & Data Stream Source (ESP32 Ready) */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="border-b border-surface-border/60 pb-2.5">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Telemetry & Data Source (ESP32 Integration Layer)
          </h3>
          <p className="text-xs text-txt-secondary font-mono">
            Frontend data layer source and connection link
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div
            onClick={() => setTelemetrySource('simulator')}
            className={clsx(
              "p-3 rounded-lg border cursor-pointer transition-all",
              telemetrySource === 'simulator'
                ? "border-accent bg-accent-subtle/40 ring-1 ring-accent"
                : "border-surface-border bg-bg-primary hover:border-txt-muted/50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">Live Mock Generator</span>
              {telemetrySource === 'simulator' && <Check className="w-3.5 h-3.5 text-accent" />}
            </div>
            <p className="text-[10px] text-txt-muted">
              High-frequency multi-channel physics telemetry stream
            </p>
          </div>

          <div
            onClick={() => setTelemetrySource('websocket')}
            className={clsx(
              "p-3 rounded-lg border cursor-pointer transition-all",
              telemetrySource === 'websocket'
                ? "border-accent bg-accent-subtle/40 ring-1 ring-accent"
                : "border-surface-border bg-bg-primary hover:border-txt-muted/50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">Backend WebSocket</span>
              {telemetrySource === 'websocket' && <Check className="w-3.5 h-3.5 text-accent" />}
            </div>
            <p className="text-[10px] text-txt-muted">
              WebSocket link ws://localhost:8080/stream
            </p>
          </div>

          <div
            onClick={() => setTelemetrySource('esp32')}
            className={clsx(
              "p-3 rounded-lg border cursor-pointer transition-all",
              telemetrySource === 'esp32'
                ? "border-accent bg-accent-subtle/40 ring-1 ring-accent"
                : "border-surface-border bg-bg-primary hover:border-txt-muted/50"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-txt-primary">ESP32 Hardware Node</span>
              {telemetrySource === 'esp32' && <Check className="w-3.5 h-3.5 text-accent" />}
            </div>
            <p className="text-[10px] text-txt-muted">
              Direct ESP32 telemetry ingestion endpoint
            </p>
          </div>
        </div>

        {/* Telemetry Stream Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-txt-secondary">Stream Status:</span>
            <span className={clsx("font-bold", isSimulating ? "text-status-healthy" : "text-status-warning")}>
              {isSimulating ? '● STREAM ACTIVE' : '○ STREAM PAUSED'}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleSimulation}
          >
            {isSimulating ? 'Pause Stream' : 'Resume Stream'}
          </Button>
        </div>
      </div>

      {/* 3. Measurement Units */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="border-b border-surface-border/60 pb-2.5">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            Measurement Units & Precision
          </h3>
          <p className="text-xs text-txt-secondary font-mono">
            Configured engineering units for sensor parameters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block mb-1.5">
              Temperature Unit
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={clsx(
                  "flex-1 py-1.5 rounded border text-xs font-bold transition-colors",
                  tempUnit === 'C' ? "bg-accent text-white border-accent" : "bg-bg-primary text-txt-secondary border-surface-border"
                )}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={clsx(
                  "flex-1 py-1.5 rounded border text-xs font-bold transition-colors",
                  tempUnit === 'F' ? "bg-accent text-white border-accent" : "bg-bg-primary text-txt-secondary border-surface-border"
                )}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block mb-1.5">
              Vibration Velocity Unit
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVibUnit('mms')}
                className={clsx(
                  "flex-1 py-1.5 rounded border text-xs font-bold transition-colors",
                  vibUnit === 'mms' ? "bg-accent text-white border-accent" : "bg-bg-primary text-txt-secondary border-surface-border"
                )}
              >
                Velocity (mm/s)
              </button>
              <button
                type="button"
                onClick={() => setVibUnit('g')}
                className={clsx(
                  "flex-1 py-1.5 rounded border text-xs font-bold transition-colors",
                  vibUnit === 'g' ? "bg-accent text-white border-accent" : "bg-bg-primary text-txt-secondary border-surface-border"
                )}
              >
                Acceleration (g)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Factory Reset / Diagnostics */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="font-bold text-txt-primary block">Factory State Reset</span>
          <span className="text-[11px] text-txt-muted">Reset all sensor baseline readings and thresholds</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={resetAll}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Factory Data
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
