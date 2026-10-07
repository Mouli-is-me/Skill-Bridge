import React from 'react';
import { Select } from '../ui/Select';
import { Search } from 'lucide-react';
import { Machine } from '../../types/machine';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severityFilter: string;
  onSeverityChange: (sev: string) => void;
  machineFilter: string;
  onMachineChange: (m: string) => void;
  typeFilter: string;
  onTypeChange: (t: string) => void;
  machines: Machine[];
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  machineFilter,
  onMachineChange,
  typeFilter,
  onTypeChange,
  machines
}) => {
  const severityOptions = [
    { label: 'All Severities', value: 'ALL' },
    { label: 'ERROR / CRITICAL', value: 'ERROR' },
    { label: 'WARNING', value: 'WARNING' },
    { label: 'INFO', value: 'INFO' }
  ];

  const machineOptions = [
    { label: 'All Fleet Machines', value: 'ALL' },
    ...machines.map(m => ({ label: `${m.id} - ${m.name}`, value: m.id }))
  ];

  const typeOptions = [
    { label: 'All Event Types', value: 'ALL' },
    { label: 'Temperature Exceeded', value: 'TEMP_EXCEEDED' },
    { label: 'Vibration High', value: 'VIB_HIGH' },
    { label: 'Machine Stopped', value: 'MACHINE_STOPPED' },
    { label: 'Restarted', value: 'RESTARTED' },
    { label: 'Threshold Updated', value: 'THRESHOLD_UPDATED' }
  ];

  return (
    <div className="bg-surface border border-surface-border p-4 rounded-xl shadow-subtle flex flex-wrap items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search events by message, ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded-md text-xs font-mono pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          options={severityOptions}
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
        />

        <Select
          options={machineOptions}
          value={machineFilter}
          onChange={(e) => onMachineChange(e.target.value)}
        />

        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        />
      </div>
    </div>
  );
};
