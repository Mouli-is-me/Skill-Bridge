import React, { useState } from "react";
import { useMachineStore } from "../store/machineStore";
import { ComparisonSelector } from "../components/compare/ComparisonSelector";
import { ComparisonTable } from "../components/compare/ComparisonTable";
import { ComparisonChart } from "../components/compare/ComparisonChart";

export const ComparePage: React.FC = () => {
  const { machines, historyMap } = useMachineStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([
    "M-[03]".includes("03") ? "M-03" : "M-01",
    "M-01",
  ]);
  const [compareMode, setCompareMode] = useState<
    "machine-vs-machine" | "current-vs-previous"
  >("machine-vs-machine");
  const [shiftPeriod, setShiftPeriod] = useState<string>("SHIFT");

  const handleToggleMachine = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 4) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedMachines = machines.filter((m) => selectedIds.includes(m.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface border border-surface-border p-3.5 rounded-md">
        <h2 className="text-sm font-bold text-txt-primary tracking-tight font-mono">
          MULTI-ASSET COMPARISON & BENCHMARKING
        </h2>
        <p className="text-[11px] text-txt-secondary font-mono mt-0.5">
          Side-by-side asset telemetry variance and shift period comparison
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
      <ComparisonChart
        selectedMachines={selectedMachines}
        historyMap={historyMap}
      />
    </div>
  );
};
