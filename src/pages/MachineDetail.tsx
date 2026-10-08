import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { MachineModuleCard } from '../components/machines/MachineModuleCard';
import { SensorChart } from '../components/machines/SensorChart';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getMachineModuleStats } from '../utils/moduleHelpers';
import { formatTimeAgo } from '../utils/formatting';
import { ArrowLeft, Layers } from 'lucide-react';

export const MachineDetailPage: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { machines, historyMap } = useMachineStore();

  const paramClean = (machineId || '').replace('-', '').toUpperCase();
  const machine = machines.find((m) => m.id.replace('-', '').toUpperCase() === paramClean);

  if (!machine) {
    return <Navigate to="/machines" replace />;
  }

  const modules = machine.modules || [];
  const stats = getMachineModuleStats(modules);
  const history = historyMap[machine.id];

  const isFault = stats.faults > 0;
  const isWarning = stats.warnings > 0 && stats.faults === 0;
  const isOffline = !machine.isOnline;
  const statusLabel = isOffline ? 'OFFLINE' : isFault ? 'FAULT' : isWarning ? 'WARNING' : 'HEALTHY';

  const isHardwareMachine = machine.isHardware || machine.id.replace('-', '') === 'M01';

  return (
    <div className="space-y-4">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate('/machines')}
          className="inline-flex items-center gap-1 text-xs font-mono text-txt-secondary hover:text-txt-primary transition-colors mb-2.5 select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Machine Directory</span>
        </button>

        {/* Machine Header */}
        <div className="bg-surface border border-surface-border p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-base text-txt-primary">
                {machine.id}
              </span>
              <span className="text-txt-muted text-xs font-mono">•</span>
              <h2 className="text-sm font-semibold text-txt-primary">
                {machine.name}
              </h2>

              {isHardwareMachine ? (
                <span className="px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  PHYSICAL HARDWARE
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-medium bg-bg-secondary text-txt-muted border border-surface-border">
                  TELEMETRY SIM
                </span>
              )}

              <Badge status={statusLabel} size="sm">
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-txt-secondary">
              <span>Model: {machine.model}</span>
              <span className="text-txt-muted">•</span>
              <span>Location: {machine.location} ({machine.section})</span>
              <span className="text-txt-muted">•</span>
              <span>Updated: {formatTimeAgo(machine.lastUpdated)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {isHardwareMachine && (
              <>
                <div className="bg-bg-primary/50 px-2.5 py-1 rounded-xs border border-surface-border text-center">
                  <span className="text-[10px] text-txt-muted block uppercase">State</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {machine.metrics.machineState || 'RUNNING'}
                  </span>
                </div>

                <div className="bg-bg-primary/50 px-2.5 py-1 rounded-xs border border-surface-border text-center">
                  <span className="text-[10px] text-txt-muted block uppercase">Score</span>
                  <span className="font-bold text-txt-primary text-xs">
                    {machine.metrics.score ?? 95} / 100
                  </span>
                </div>
              </>
            )}

            <div className="bg-bg-primary/50 px-2.5 py-1 rounded-xs border border-surface-border text-center">
              <span className="text-[10px] text-txt-muted block uppercase">Sensors</span>
              <span className="font-bold text-txt-primary text-xs">{stats.healthy} / {stats.total} Healthy</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/machines')}
            >
              Directory
            </Button>
          </div>
        </div>
      </div>

      {/* Hardware Sensor Modules */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-txt-secondary" />
            <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
              HARDWARE MODULES ({modules.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-txt-muted">
            MPU6050 • DS18B20 • LM393
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modules.map((mod) => (
            <MachineModuleCard
              key={mod.id}
              module={mod}
              machineId={machine.id}
            />
          ))}
        </div>
      </div>

      {/* Telemetry Stream Chart */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-txt-primary uppercase font-mono tracking-wider">
            SENSOR TELEMETRY STREAM
          </h3>
          <span className="text-xs font-mono text-txt-muted">
            Continuous telemetry feed
          </span>
        </div>

        <SensorChart
          history={history}
          tempWarningThreshold={machine.thresholds.tempWarning}
          vibWarningThreshold={machine.thresholds.vibWarning}
        />
      </div>
    </div>
  );
};
