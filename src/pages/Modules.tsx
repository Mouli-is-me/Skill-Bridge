import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { formatTimeAgo } from '../utils/formatting';
import { Search, Layers, ArrowRight, Activity, Thermometer, Gauge, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export const ModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const machines = useMachineStore((s) => s.machines);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [machineFilter, setMachineFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Collect all modules
  const allModules = useMemo(() => {
    return machines.flatMap((m) =>
      (m.modules || []).map((mod) => ({
        ...mod,
        parentMachineId: m.id,
        parentMachineName: m.name,
        isMachineOnline: m.isOnline
      }))
    );
  }, [machines]);

  // Filter modules
  const filteredModules = useMemo(() => {
    return allModules.filter((mod) => {
      const matchesSearch =
        mod.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.parentMachineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.parentMachineName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMachine = machineFilter === 'ALL' || mod.parentMachineId === machineFilter;
      const matchesType = typeFilter === 'ALL' || mod.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || mod.status === statusFilter;

      return matchesSearch && matchesMachine && matchesType && matchesStatus;
    });
  }, [allModules, searchQuery, machineFilter, typeFilter, statusFilter]);

  const machineOptions = [
    { label: 'All Machines', value: 'ALL' },
    ...machines.map((m) => ({ label: `${m.id} (${m.name})`, value: m.id }))
  ];

  const typeOptions = [
    { label: 'All Module Types', value: 'ALL' },
    { label: 'Motor Drive', value: 'Motor' },
    { label: 'Vibration Sensor', value: 'Vibration' },
    { label: 'Thermal Sensor', value: 'Temperature' },
    { label: 'Drive Unit', value: 'Drive' },
    { label: 'Spindle Drive', value: 'Spindle' },
    { label: 'Drafting System', value: 'Drafting' },
    { label: 'Power Unit', value: 'Power' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'HEALTHY', value: 'HEALTHY' },
    { label: 'WARNING', value: 'WARNING' },
    { label: 'FAULT', value: 'FAULT' },
    { label: 'OFFLINE', value: 'OFFLINE' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-surface-border p-4 rounded-lg shadow-subtle">
        <div>
          <h2 className="text-base font-bold text-txt-primary tracking-tight font-mono">
            MODULES DIRECTORY
          </h2>
          <p className="text-xs text-txt-secondary font-mono">
            {allModules.length} Modules & sub-assemblies across all fleet machines
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search module ID, machine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Select
            options={machineOptions}
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="text-xs max-w-[180px]"
          />

          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs"
          />

          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-txt-muted">
        <span>Showing {filteredModules.length} of {allModules.length} modules</span>
      </div>

      {filteredModules.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-lg p-10 text-center font-mono text-xs text-txt-muted">
          No modules matched your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((mod) => {
            const isFault = mod.status === 'FAULT';
            const isWarning = mod.status === 'WARNING';
            const isOffline = mod.status === 'OFFLINE' || !mod.config.enabled;
            const statusLabel = isFault ? 'FAULT' : isWarning ? 'WARNING' : isOffline ? 'OFFLINE' : 'HEALTHY';

            return (
              <div
                key={`${mod.parentMachineId}-${mod.id}`}
                className={clsx(
                  "bg-surface border rounded-lg p-4 flex flex-col justify-between transition-all shadow-subtle hover:border-txt-muted/50",
                  isFault ? "border-status-fault-border bg-status-fault-bg/10" :
                  isWarning ? "border-status-warning-border bg-status-warning-bg/10" :
                  "border-surface-border"
                )}
              >
                <div>
                  {/* Top Bar: Module Name & Status */}
                  <div className="flex items-start justify-between pb-2.5 border-b border-surface-border/60">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-txt-muted">
                        <span className="font-bold text-txt-primary">{mod.parentMachineId}</span>
                        <span>•</span>
                        <span>{mod.id}</span>
                      </div>
                      <h4 className="text-xs font-bold text-txt-primary mt-0.5">
                        {mod.name}
                      </h4>
                    </div>

                    <Badge status={statusLabel} size="sm">
                      {statusLabel}
                    </Badge>
                  </div>

                  {/* Sensor preview list */}
                  <div className="py-2.5 space-y-1.5 font-mono text-xs">
                    {mod.sensors.slice(0, 3).map((sensor) => (
                      <div key={sensor.id} className="flex justify-between py-0.5 text-[11px]">
                        <span className="text-txt-secondary truncate max-w-[130px]">{sensor.name}</span>
                        <span className={clsx(
                          "font-bold",
                          sensor.status === 'FAULT' ? "text-status-fault" :
                          sensor.status === 'WARNING' ? "text-status-warning" : "text-txt-primary"
                        )}>
                          {sensor.value} {sensor.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer: Last Update & Link */}
                <div className="pt-2.5 border-t border-surface-border/60 flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-txt-muted">
                    {formatTimeAgo(mod.lastUpdated)}
                  </span>

                  <button
                    onClick={() => navigate(`/machines/${mod.parentMachineId}/modules/${mod.id}`)}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
