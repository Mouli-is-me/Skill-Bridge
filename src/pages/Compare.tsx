import React, { useState } from 'react';
import { useMachineStore } from '../store/machineStore';
import { ComparisonSelector } from '../components/compare/ComparisonSelector';
import { ComparisonTable } from '../components/compare/ComparisonTable';
import { ComparisonChart } from '../components/compare/ComparisonChart';

export const ComparePage: React.FC = () => {
  const { machines, historyMap } = useMachineStore();

  // Initial selection: M-03 (problem machine) vs M-01 (top performer)
  const [selectedIds, setSelectedIds] = useState<string[]>(['M-[03]'.includes('03') ? 'M-03' : 'M-01', 'M-01']);
  const [compareMode, setCompareMode] = useState<'machine-vs-machine' | 'current-vs-previous'>('machine-vs-machine');
  const [shiftPeriod, setShiftPeriod] = useState<string>('SHIFT');

  const handleToggleMachine = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // Keep at least one selected
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) return; // Max 4 machines
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedMachines = machines.filter(m => selectedIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-surface border border-surface-border p-4 rounded-xl shadow-subtle">
        <h2 className="text-xl font-extrabold text-txt-primary tracking-tight">Performance Comparison & Benchmarking</h2>
        <p className="text-xs text-txt-secondary font-mono mt-0.5">
          Evaluate multi-asset sensor variances and shift period overlays
        </p>
      </div>

      {/* Comparison Selector Controls */}
      <ComparisonSelector
        machines={machines}
        selectedIds={selectedIds}
        onToggleMachine={handleToggleMachine}
        compareMode={compareMode}
        onSetCompareMode={setCompareMode}
        shiftPeriod={shiftPeriod}
        onSetShiftPeriod={setShiftPeriod}
      />

      {/* Cross-Asset Comparison Table */}
      <ComparisonTable selectedMachines={selectedMachines} />

      {/* Comparative Overlay Charts */}
      <ComparisonChart selectedMachines={selectedMachines} historyMap={historyMap} />
    </div>
  );
};
