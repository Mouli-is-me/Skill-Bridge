import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { MachineModuleCard } from '../components/machines/MachineModuleCard';
import { SensorChart } from '../components/machines/SensorChart';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getMachineModuleStats } from '../utils/moduleHelpers';
import { formatTimeAgo } from '../utils/formatting';
import { ArrowLeft, RefreshCw, Cpu, Layers } from 'lucide-react';

export const MachineDetailPage: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { machines, historyMap } = useMachineStore();

  const machine = machines.find((m) => m.id === (machineId || '').toUpperCase());

  if (!machine) {
    return <Navigate to="/machines" replace />;
  }

  const modules = machine.modules || [];
  const stats = getMachineModuleStats(modules);
  const history = historyMap[machine.id];

  const isFault = stats.faults > 0;
  const isWarning = stats.warnings > 0 && stats.faults === 0;
  const isOffline = !machine.isOnline;
  const statusLabel = isFault ? 'FAULT' : isWarning ? 'WARNING' : isOffline ? 'OFFLINE' : 'ONLINE';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/machines')}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-txt-secondary hover:text-txt-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Machines</span>
        </button>

        {/* Machine Identity Header Card */}
        <div className="bg-surface border border-surface-border p-4 rounded-lg shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-lg text-txt-primary">
                {machine.id}
              </span>
              <span className="text-txt-muted text-xs font-mono">•</span>
              <h2 className="text-base font-semibold text-txt-primary">
                {machine.name}
              </h2>
              <Badge status={statusLabel} size="sm">
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-txt-secondary">
              <span>{machine.model}</span>
              <span className="text-txt-muted">•</span>
              <span>{machine.location} ({machine.section})</span>
              <span className="text-txt-muted">•</span>
              <span>Last updated: {formatTimeAgo(machine.lastUpdated)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-bg-primary px-3 py-1.5 rounded border border-surface-border text-center">
              <span className="text-[10px] text-txt-muted block uppercase">Modules</span>
              <span className="font-bold text-txt-primary">{stats.healthy} / {stats.total} Healthy</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/machines')}
            >
              Fleet List
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Focus: MODULES Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-txt-secondary" />
            <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
              MODULES & SUB-SYSTEMS ({modules.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-txt-muted">
            Live telemetry updated continuously
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <MachineModuleCard
              key={mod.id}
              module={mod}
              machineId={machine.id}
            />
          ))}
        </div>
      </div>

      {/* Sensor Telemetry Trend Chart */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-txt-primary uppercase font-mono tracking-wider">
            MACHINE TELEMETRY TRENDS
          </h3>
          <span className="text-xs font-mono text-txt-muted">
            High-frequency continuous stream
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
