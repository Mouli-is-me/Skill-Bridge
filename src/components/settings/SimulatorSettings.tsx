import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMachineStore } from '../../store/machineStore';
import { useSimulationStore, ConnectionStatus } from '../../store/simulationStore';
import { Activity, RefreshCw, Wifi, WifiOff, AlertTriangle, Zap } from 'lucide-react';

export const SimulatorSettings: React.FC = () => {
  const { resetAll, reseedHistory } = useMachineStore();
  const { connectionStatus, setConnectionStatus, setM03ScenarioStage } = useSimulationStore();

  const connectionButtons: { status: ConnectionStatus; label: string; icon: any }[] = [
    { status: 'LIVE', label: 'LIVE (Normal)', icon: Wifi },
    { status: 'DEGRADED', label: 'DEGRADED Link', icon: AlertTriangle },
    { status: 'CONNECTION_LOST', label: 'CONNECTION LOST', icon: WifiOff },
  ];

  return (
    <Card className="space-y-6">
      <div className="border-b border-surface-border pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="text-base font-bold text-txt-primary">Simulator Engine Controls & Data Testing</h3>
        </div>
        <p className="text-xs text-txt-secondary font-mono">
          Simulate connection drops, trigger M-03 anomaly story stages, or reseed historical buffers
        </p>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {/* Network Connection State Toggle */}
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-xl space-y-3">
          <label className="font-bold text-txt-primary uppercase tracking-wider block text-xs">
            Telemetry Connection State Simulation:
          </label>
          <div className="flex flex-wrap gap-3">
            {connectionButtons.map((b) => {
              const Icon = b.icon;
              const isActive = connectionStatus === b.status;
              return (
                <Button
                  key={b.status}
                  size="sm"
                  variant={isActive ? "primary" : "outline"}
                  onClick={() => setConnectionStatus(b.status)}
                  icon={<Icon className="w-3.5 h-3.5" />}
                >
                  {b.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Demo Story Trigger Controls */}
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-xl space-y-3">
          <label className="font-bold text-txt-primary uppercase tracking-wider block text-xs">
            M-03 Anomaly Demo Story Triggers:
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setM03ScenarioStage('NORMAL')}
            >
              Set M-03 Normal
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setM03ScenarioStage('OVERHEATING')}
              icon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
            >
              Trigger Overheating (82°C)
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setM03ScenarioStage('STOPPED')}
            >
              Trigger Emergency Stop
            </Button>
          </div>
        </div>

        {/* Data Reseed & Reset */}
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-txt-primary text-xs">Historical Data Reseed & Factory Reset</h4>
            <p className="text-[11px] text-txt-secondary font-sans mt-0.5">
              Reset fleet metrics, clear injected events, and regenerate 30 days of seeded telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={reseedHistory} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Reseed 30-Day History
            </Button>
            <Button size="sm" variant="danger" onClick={resetAll}>
              Full Factory Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
