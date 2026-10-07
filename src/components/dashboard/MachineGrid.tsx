import React from 'react';
import { Machine } from '../../types/machine';
import { MachineCard } from './MachineCard';

interface MachineGridProps {
  machines: Machine[];
  filterStatus?: string | null;
}

export const MachineGrid: React.FC<MachineGridProps> = ({ machines, filterStatus }) => {
  const filtered = filterStatus 
    ? machines.filter(m => m.status === filterStatus)
    : machines;

  if (filtered.length === 0) {
    return (
      <div className="bg-surface border border-surface-border rounded-xl p-8 text-center">
        <p className="text-sm font-semibold text-txt-secondary">No machines match the selected status filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((machine) => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
};
