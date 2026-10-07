import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Machine } from '../../types/machine';
import { useMachineStore } from '../../store/machineStore';
import { Sliders, Save, CheckCircle } from 'lucide-react';

interface ThresholdSettingsProps {
  machines: Machine[];
}

export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ machines }) => {
  const updateMachineThresholds = useMachineStore((s) => s.updateMachineThresholds);

  const [selectedMachineId, setSelectedMachineId] = useState<string>('M-03');
  const targetMachine = machines.find(m => m.id === selectedMachineId) || machines[0];

  const [tempWarning, setTempWarning] = useState<number>(targetMachine.thresholds.tempWarning);
  const [tempCritical, setTempCritical] = useState<number>(targetMachine.thresholds.tempCritical);
  const [vibWarning, setVibWarning] = useState<number>(targetMachine.thresholds.vibWarning);
  const [vibCritical, setVibCritical] = useState<number>(targetMachine.thresholds.vibCritical);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleMachineSelect = (id: string) => {
    setSelectedMachineId(id);
    const m = machines.find(item => item.id === id);
    if (m) {
      setTempWarning(m.thresholds.tempWarning);
      setTempCritical(m.thresholds.tempCritical);
      setVibWarning(m.thresholds.vibWarning);
      setVibCritical(m.thresholds.vibCritical);
    }
  };

  const handleSave = () => {
    updateMachineThresholds(selectedMachineId, {
      ...targetMachine.thresholds,
      tempWarning: Number(tempWarning),
      tempCritical: Number(tempCritical),
      vibWarning: Number(vibWarning),
      vibCritical: Number(vibCritical),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const machineOptions = machines.map(m => ({ label: `${m.id} - ${m.name}`, value: m.id }));

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-txt-primary">Operational Threshold Configuration</h3>
          </div>
          <p className="text-xs text-txt-secondary font-mono">
            Customize alarm trigger limits per machine asset (consumed live by simulator)
          </p>
        </div>

        <Select
          options={machineOptions}
          value={selectedMachineId}
          onChange={(e) => handleMachineSelect(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Temperature Thresholds */}
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-xl space-y-4">
          <h4 className="font-bold text-txt-primary uppercase tracking-wider text-xs border-b border-surface-border/60 pb-2">
            Temperature Thresholds (°C)
          </h4>

          <div>
            <label className="block text-txt-secondary text-[11px] mb-1">Temperature Warning Limit (°C)</label>
            <input
              type="number"
              step="0.5"
              value={tempWarning}
              onChange={(e) => setTempWarning(Number(e.target.value))}
              className="w-full bg-surface text-txt-primary border border-surface-border rounded-md px-3 py-2 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <span className="text-[10px] text-txt-muted mt-1 block">Triggers WARNING status & event log when exceeded</span>
          </div>

          <div>
            <label className="block text-txt-secondary text-[11px] mb-1">Temperature Critical Limit (°C)</label>
            <input
              type="number"
              step="0.5"
              value={tempCritical}
              onChange={(e) => setTempCritical(Number(e.target.value))}
              className="w-full bg-surface text-txt-primary border border-surface-border rounded-md px-3 py-2 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
            <span className="text-[10px] text-txt-muted mt-1 block">Triggers ERROR status & emergency event log</span>
          </div>
        </div>

        {/* Vibration Thresholds */}
        <div className="bg-bg-primary/80 border border-surface-border p-4 rounded-xl space-y-4">
          <h4 className="font-bold text-txt-primary uppercase tracking-wider text-xs border-b border-surface-border/60 pb-2">
            Vibration Amplitude Limits (mm/s)
          </h4>

          <div>
            <label className="block text-txt-secondary text-[11px] mb-1">Vibration Warning Limit (mm/s)</label>
            <input
              type="number"
              step="0.1"
              value={vibWarning}
              onChange={(e) => setVibWarning(Number(e.target.value))}
              className="w-full bg-surface text-txt-primary border border-surface-border rounded-md px-3 py-2 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <span className="text-[10px] text-txt-muted mt-1 block">Triggers WARNING event when frame vibration rises</span>
          </div>

          <div>
            <label className="block text-txt-secondary text-[11px] mb-1">Vibration Critical Limit (mm/s)</label>
            <input
              type="number"
              step="0.1"
              value={vibCritical}
              onChange={(e) => setVibCritical(Number(e.target.value))}
              className="w-full bg-surface text-txt-primary border border-surface-border rounded-md px-3 py-2 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
            <span className="text-[10px] text-txt-muted mt-1 block">Triggers CRITICAL vibration emergency stop signal</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-surface-border">
        {savedSuccess ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Thresholds saved! Simulator updated dynamically.
          </span>
        ) : (
          <span className="text-[11px] font-mono text-txt-muted">
            Target asset: {selectedMachineId}
          </span>
        )}

        <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
          Save Threshold Settings
        </Button>
      </div>
    </Card>
  );
};
