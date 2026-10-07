import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Machine } from '../../types/machine';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ComparisonSelectorProps {
  machines: Machine[];
  selectedIds: string[];
  onToggleMachine: (id: string) => void;
  compareMode: 'machine-vs-machine' | 'current-vs-previous';
  onSetCompareMode: (mode: 'machine-vs-machine' | 'current-vs-previous') => void;
  shiftPeriod: string;
  onSetShiftPeriod: (period: string) => void;
}

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  machines,
  selectedIds,
  onToggleMachine,
  compareMode,
  onSetCompareMode,
  shiftPeriod,
  onSetShiftPeriod
}) => {
  const periodOptions = [
    { label: 'Current Shift vs. Previous Shift', value: 'SHIFT' },
    { label: 'Today vs. Yesterday', value: 'DAY' },
    { label: 'Current Week vs. Last Week', value: 'WEEK' }
  ];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Comparison Parameters & Scope</h3>
          <p className="text-xs text-txt-secondary font-mono">Select assets and shift timeframes for cross-machine benchmarking</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-bg-tertiary p-1 rounded-lg border border-surface-border font-mono text-xs">
            <button
              onClick={() => onSetCompareMode('machine-vs-machine')}
              className={clsx(
                "px-3 py-1.5 rounded font-semibold transition-all",
                compareMode === 'machine-vs-machine' ? "bg-surface text-txt-primary shadow-subtle" : "text-txt-secondary hover:text-txt-primary"
              )}
            >
              Asset vs. Asset
            </button>
            <button
              onClick={() => onSetCompareMode('current-vs-previous')}
              className={clsx(
                "px-3 py-1.5 rounded font-semibold transition-all",
                compareMode === 'current-vs-previous' ? "bg-surface text-txt-primary shadow-subtle" : "text-txt-secondary hover:text-txt-primary"
              )}
            >
              Period Overlay
            </button>
          </div>

          <Select
            options={periodOptions}
            value={shiftPeriod}
            onChange={(e) => onSetShiftPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* Machine Checkbox Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-txt-secondary font-mono uppercase tracking-wider block">
          Select Machines to Compare ({selectedIds.length} Selected, Max 4):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {machines.map((m) => {
            const isChecked = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => onToggleMachine(m.id)}
                className={clsx(
                  "flex items-center justify-between p-2.5 rounded-lg border font-mono text-xs transition-all select-none text-left",
                  isChecked
                    ? "bg-accent/10 border-accent text-accent font-bold"
                    : "bg-surface border-surface-border text-txt-primary hover:bg-surface-hover"
                )}
              >
                <div>
                  <span className="block font-bold">{m.id}</span>
                  <span className="text-[10px] text-txt-secondary font-sans truncate block">{m.name}</span>
                </div>
                {isChecked && (
                  <div className="w-4 h-4 rounded bg-accent text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
