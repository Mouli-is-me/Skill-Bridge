import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { useSimulationStore } from '../store/simulationStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatTimeAgo } from '../utils/formatting';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Save,
  Check,
  Radio,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { clsx } from 'clsx';

export const ModuleDetailPage: React.FC = () => {
  const { machineId, moduleId } = useParams<{ machineId?: string; moduleId?: string }>();
  const navigate = useNavigate();
  const { machines, updateModuleConfig, updateModuleThresholds, setModuleEnabled, setModuleDataCollection } = useMachineStore();
  const { isSimulating, lastSyncTime } = useSimulationStore();

  // Find target machine and module
  const targetMachine = machines.find((m) => {
    if (machineId) return m.id === machineId.toUpperCase();
    return (m.modules || []).some(mod => mod.id === (moduleId || '').toUpperCase());
  });

  const targetModule = targetMachine?.modules?.find(
    (mod) => mod.id === (moduleId || '').toUpperCase()
  );

  // If not found, redirect to machines
  if (!targetMachine || !targetModule) {
    return <Navigate to="/machines" replace />;
  }

  // Active parameter selected for Live Chart
  const [selectedSensorKey, setSelectedSensorKey] = useState<string>(
    targetModule.config.primarySensorKey || targetModule.sensors[0]?.key || 'temperature'
  );

  // Management Form State
  const [samplingRate, setSamplingRate] = useState<number>(targetModule.config.samplingRate);
  const [isEnabled, setIsEnabled] = useState<boolean>(targetModule.config.enabled);
  const [dataCollection, setDataCollection] = useState<boolean>(targetModule.config.dataCollection);
  const [warningThreshold, setWarningThreshold] = useState<number>(targetModule.config.warningThreshold);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(targetModule.config.criticalThreshold);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Real-time seconds counter
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffMs = Date.now() - new Date(targetModule.lastUpdated).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [targetModule.lastUpdated]);

  // Keep local form in sync when module thresholds change externally
  useEffect(() => {
    setWarningThreshold(targetModule.config.warningThreshold);
    setCriticalThreshold(targetModule.config.criticalThreshold);
    setIsEnabled(targetModule.config.enabled);
    setDataCollection(targetModule.config.dataCollection);
    setSamplingRate(targetModule.config.samplingRate);
  }, [targetModule.id]);

  // Find currently active sensor
  const activeSensor = targetModule.sensors.find((s) => s.key === selectedSensorKey) || targetModule.sensors[0];

  // Build live chart history buffer from sensor's recent points or synthetic buffer
  const chartData = useMemo(() => {
    const baseVal = activeSensor ? activeSensor.value : 50;
    const history = activeSensor?.history || [baseVal * 0.98, baseVal * 0.99, baseVal];
    
    return history.map((val, idx) => {
      const secOffset = (history.length - 1 - idx) * samplingRate;
      return {
        time: secOffset === 0 ? 'Now' : `-${secOffset}s`,
        value: Number(val.toFixed(2)),
        warning: warningThreshold,
        critical: criticalThreshold
      };
    });
  }, [activeSensor?.value, activeSensor?.history, samplingRate, warningThreshold, criticalThreshold]);

  // Save changes handler
  const handleSaveChanges = () => {
    updateModuleConfig(targetMachine.id, targetModule.id, {
      samplingRate,
      enabled: isEnabled,
      dataCollection,
      warningThreshold,
      criticalThreshold
    });

    updateModuleThresholds(targetMachine.id, targetModule.id, warningThreshold, criticalThreshold);
    setModuleEnabled(targetMachine.id, targetModule.id, isEnabled);
    setModuleDataCollection(targetMachine.id, targetModule.id, dataCollection);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isFault = targetModule.status === 'FAULT';
  const isWarning = targetModule.status === 'WARNING';
  const isOffline = targetModule.status === 'OFFLINE' || !isEnabled;

  const statusLabel = isFault 
    ? 'FAULT' 
    : isWarning 
    ? 'WARNING' 
    : isOffline 
    ? 'OFFLINE' 
    : 'NORMAL';

  // Condition message
  const conditionMessage = isFault
    ? `Critical limit exceeded: ${activeSensor?.name || 'Sensor'} is at ${activeSensor?.value} ${activeSensor?.unit} (Critical Threshold: ${criticalThreshold} ${activeSensor?.unit})`
    : isWarning
    ? `Warning threshold exceeded: ${activeSensor?.name || 'Sensor'} is approaching critical limits at ${activeSensor?.value} ${activeSensor?.unit} (Warning Threshold: ${warningThreshold} ${activeSensor?.unit})`
    : isOffline
    ? 'Module is disabled or offline. Telemetry acquisition halted.'
    : 'Operating normally within configured limits.';

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate(`/machines/${targetMachine.id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-txt-secondary hover:text-txt-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>← {targetMachine.id} / Modules</span>
      </button>

      {/* Header: Module Identity & Real-Time Status */}
      <div className="bg-surface border border-surface-border p-4 rounded-lg shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-primary text-txt-muted border border-surface-border uppercase font-semibold">
              {targetModule.type} MODULE
            </span>
            <span className="text-txt-muted text-xs font-mono">•</span>
            <span className="text-xs font-mono text-txt-secondary">
              Machine: {targetMachine.id} ({targetMachine.name})
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl font-bold text-txt-primary tracking-tight font-sans">
              {targetModule.name}
            </h2>
            <Badge status={statusLabel} size="sm">
              {statusLabel}
            </Badge>
          </div>

          <div className="text-xs font-mono text-txt-muted mt-1">
            Module ID: <strong className="text-txt-primary">{targetModule.id}</strong>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex flex-col sm:items-end font-mono text-xs text-txt-secondary">
          <div className="flex items-center gap-2 bg-bg-primary px-3 py-1.5 rounded border border-surface-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-healthy opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-healthy"></span>
            </span>
            <span className="font-bold text-txt-primary">● LIVE</span>
            <span className="text-txt-muted text-[11px]">
              Updated {secondsAgo === 0 ? '1 sec ago' : `${secondsAgo}s ago`}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE DATA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
            LIVE SENSOR DATA
          </h3>
          <span className="text-xs font-mono text-txt-muted">
            {targetModule.sensors.length} Active Channels
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {targetModule.sensors.map((sensor) => {
            const isWarn = sensor.status === 'WARNING';
            const isFlt = sensor.status === 'FAULT';

            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensorKey(sensor.key)}
                className={clsx(
                  "p-3 rounded-lg border transition-all cursor-pointer shadow-subtle",
                  selectedSensorKey === sensor.key
                    ? "ring-2 ring-accent border-accent/40 bg-surface"
                    : "bg-surface hover:border-txt-muted/50 border-surface-border",
                  isFlt ? "border-status-fault-border bg-status-fault-bg/20" :
                  isWarn ? "border-status-warning-border bg-status-warning-bg/20" : ""
                )}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-txt-muted text-[11px] truncate uppercase font-semibold">
                    {sensor.name}
                  </span>
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isFlt ? "bg-status-fault" : isWarn ? "bg-status-warning" : "bg-status-healthy"
                  )} />
                </div>

                <div className="mt-2">
                  <span className={clsx(
                    "text-xl sm:text-2xl font-mono font-bold tracking-tight block",
                    isFlt ? "text-status-fault" : isWarn ? "text-status-warning" : "text-txt-primary"
                  )}>
                    {sensor.value} <span className="text-xs font-normal text-txt-secondary">{sensor.unit}</span>
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-surface-border/50 text-[10px] font-mono text-txt-muted flex justify-between">
                  <span>Warn: {sensor.warningThreshold}</span>
                  <span>Crit: {sensor.criticalThreshold}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LIVE CHART */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-txt-secondary" />
              <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
                LIVE TELEMETRY CHART: {activeSensor?.name}
              </h3>
            </div>
            <p className="text-xs font-mono text-txt-muted mt-0.5">
              Live continuous stream ({samplingRate}s interval)
            </p>
          </div>

          {/* Parameter switchers */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {targetModule.sensors.map((sensor) => (
              <button
                key={sensor.id}
                onClick={() => setSelectedSensorKey(sensor.key)}
                className={clsx(
                  "px-2.5 py-1 rounded text-xs transition-colors border",
                  selectedSensorKey === sensor.key
                    ? "bg-accent text-white font-bold border-accent shadow-subtle"
                    : "bg-bg-primary text-txt-secondary hover:text-txt-primary border-surface-border"
                )}
              >
                {sensor.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
              <XAxis
                dataKey="time"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                fontFamily="monospace"
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                fontFamily="monospace"
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}
              />
              {/* Threshold indicator lines */}
              <ReferenceLine
                y={warningThreshold}
                stroke="var(--status-warning)"
                strokeDasharray="4 4"
                label={{ value: `Warn (${warningThreshold})`, fill: 'var(--status-warning)', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={criticalThreshold}
                stroke="var(--status-fault)"
                strokeDasharray="4 4"
                label={{ value: `Crit (${criticalThreshold})`, fill: 'var(--status-fault)', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={activeSensor?.name || 'Reading'}
                stroke="var(--accent)"
                strokeWidth={2.2}
                dot={{ r: 3, fill: 'var(--accent)' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: STATUS */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-2">
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-2.5">
          <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
            MODULE STATUS
          </h3>
          <Badge status={statusLabel} size="md">
            ● {statusLabel}
          </Badge>
        </div>

        <div className="font-mono text-xs space-y-1.5 pt-1">
          <span className="text-txt-muted text-[11px] uppercase tracking-wider block font-semibold">
            Current Condition:
          </span>
          <p className={clsx(
            "text-sm font-medium",
            isFault ? "text-status-fault font-bold" :
            isWarning ? "text-status-warning font-semibold" :
            "text-txt-primary"
          )}>
            {conditionMessage}
          </p>
        </div>
      </div>

      {/* SECTION 4: MODULE MANAGEMENT */}
      <div className="bg-surface border border-surface-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-txt-secondary" />
            <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
              MODULE MANAGEMENT
            </h3>
          </div>
          <span className="text-xs font-mono text-txt-muted">
            Operational Parameter Controls
          </span>
        </div>

        {/* Save confirmation toast banner */}
        {saveSuccess && (
          <div className="bg-status-healthy-bg border border-status-healthy-border text-status-healthy px-3.5 py-2 rounded text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Module parameters updated and saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Sampling Rate */}
          <div className="space-y-1.5">
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block">
              Sampling Rate
            </label>
            <select
              value={samplingRate}
              onChange={(e) => setSamplingRate(Number(e.target.value))}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value={0.5}>0.5 seconds</option>
              <option value={1}>1 second</option>
              <option value={2}>2 seconds</option>
              <option value={5}>5 seconds</option>
            </select>
          </div>

          {/* Module Enabled Toggle */}
          <div className="space-y-1.5">
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block">
              Module State
            </label>
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={clsx(
                "w-full py-2 px-3 rounded font-bold transition-colors border text-xs",
                isEnabled
                  ? "bg-status-healthy-bg text-status-healthy border-status-healthy-border"
                  : "bg-status-offline-bg text-status-offline border-status-offline-border"
              )}
            >
              {isEnabled ? '● Enabled' : '○ Disabled'}
            </button>
          </div>

          {/* Data Collection Toggle */}
          <div className="space-y-1.5">
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block">
              Data Collection
            </label>
            <button
              type="button"
              onClick={() => setDataCollection(!dataCollection)}
              className={clsx(
                "w-full py-2 px-3 rounded font-bold transition-colors border text-xs",
                dataCollection
                  ? "bg-accent-subtle text-accent border-accent/30"
                  : "bg-bg-primary text-txt-muted border-surface-border"
              )}
            >
              {dataCollection ? 'Data Logging: ON' : 'Data Logging: OFF'}
            </button>
          </div>

          {/* Thresholds Header / Warning */}
          <div className="space-y-1.5">
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block">
              Warning Threshold ({activeSensor?.unit})
            </label>
            <input
              type="number"
              step="0.5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Critical threshold & Save Button row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs pt-1">
          <div className="space-y-1.5">
            <label className="text-txt-secondary font-semibold uppercase text-[11px] block">
              Critical Threshold ({activeSensor?.unit})
            </label>
            <input
              type="number"
              step="0.5"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3 flex items-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveChanges}
              icon={<Save className="w-4 h-4" />}
              className="w-full sm:w-auto font-mono text-xs"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
