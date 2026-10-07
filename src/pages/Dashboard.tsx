import React, { useState, useEffect } from 'react';
import { useMachineStore } from '../store/machineStore';
import { useSimulationStore } from '../store/simulationStore';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { DashboardMachineCard } from '../components/dashboard/DashboardMachineCard';
import { DashboardAlertsList } from '../components/dashboard/DashboardAlertsList';
import { Button } from '../components/ui/Button';
import { Play, Pause, RefreshCw, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { machines, events } = useMachineStore();
  const { isSimulating, toggleSimulation, lastSyncTime, updateSyncTime } = useSimulationStore();
  
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'FAULT'>('ALL');
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffMs = Date.now() - new Date(lastSyncTime).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Filter machines based on selected status filter
  const filteredMachines = machines.filter(m => {
    if (filterStatus === 'ALL') return true;
    const hasFault = (m.modules || []).some(mod => mod.status === 'FAULT');
    const hasWarning = (m.modules || []).some(mod => mod.status === 'WARNING');

    if (filterStatus === 'FAULT') return hasFault;
    if (filterStatus === 'WARNING') return hasWarning && !hasFault;
    if (filterStatus === 'HEALTHY') return !hasFault && !hasWarning && m.isOnline;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Practical Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-surface-border p-4 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-txt-primary tracking-tight font-mono">
              SKILL BRIDGE
            </h2>
            <span className="text-txt-muted text-xs font-mono">•</span>
            <span className="text-xs font-semibold text-txt-secondary">
              Industrial Monitoring System
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 font-mono text-xs text-txt-secondary">
            <span className="flex items-center gap-1.5 text-status-healthy font-bold">
              <span className="w-2 h-2 rounded-full bg-status-healthy inline-block"></span>
              SYSTEM ONLINE
            </span>
            <span className="text-txt-muted">·</span>
            <span>Last data update: {secondsAgo === 0 ? 'just now' : `${secondsAgo} seconds ago`}</span>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant={isSimulating ? "outline" : "primary"}
            onClick={toggleSimulation}
            icon={isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {isSimulating ? 'Pause Stream' : 'Resume Live'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={updateSyncTime}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Summary Strip */}
      <DashboardSummary machines={machines} />

      {/* 3. Machine Overview */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-txt-primary tracking-tight">
              Machine Overview
            </h3>
            <p className="text-xs text-txt-secondary font-mono">
              Real-time asset telemetry & component health
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-bg-primary p-1 rounded-md border border-surface-border text-xs font-mono">
            {(['ALL', 'HEALTHY', 'WARNING', 'FAULT'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterStatus === st 
                    ? 'bg-surface text-txt-primary font-bold shadow-subtle border border-surface-border' 
                    : 'text-txt-secondary hover:text-txt-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map((machine) => (
            <DashboardMachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      </div>

      {/* 4. Recent Alerts Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-txt-secondary" />
            <h3 className="text-sm font-bold text-txt-primary tracking-tight">
              Recent Alerts & Faults
            </h3>
          </div>

          <button
            onClick={() => navigate('/alerts')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover font-mono transition-colors"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <DashboardAlertsList events={events} maxCount={5} />
      </div>
    </div>
  );
};
