import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachineStore } from '../store/machineStore';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { getMachineModuleStats } from '../utils/moduleHelpers';
import { formatTimeAgo } from '../utils/formatting';
import { Search, LayoutGrid, Table as TableIcon, ArrowRight, Layers, AlertTriangle, AlertOctagon } from 'lucide-react';
import { clsx } from 'clsx';

export const MachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const machines = useMachineStore((s) => s.machines);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchesSearch = 
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model.toLowerCase().includes(searchQuery.toLowerCase());

      const modules = m.modules || [];
      const stats = getMachineModuleStats(modules);

      let machineStatusCategory = 'HEALTHY';
      if (!m.isOnline) machineStatusCategory = 'OFFLINE';
      else if (stats.faults > 0) machineStatusCategory = 'FAULT';
      else if (stats.warnings > 0) machineStatusCategory = 'WARNING';

      const matchesStatus = statusFilter === 'ALL' || 
        machineStatusCategory === statusFilter || 
        (statusFilter === 'RUNNING' && machineStatusCategory === 'HEALTHY');

      const matchesType = typeFilter === 'ALL' || m.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [machines, searchQuery, statusFilter, typeFilter]);

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'HEALTHY', value: 'HEALTHY' },
    { label: 'WARNING', value: 'WARNING' },
    { label: 'FAULT', value: 'FAULT' },
    { label: 'OFFLINE', value: 'OFFLINE' },
  ];

  const typeOptions = [
    { label: 'All Machine Types', value: 'ALL' },
    { label: 'Loom (Weaving)', value: 'Loom' },
    { label: 'Spinning Frame', value: 'Spinning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-surface-border p-4 rounded-lg shadow-subtle">
        <div>
          <h2 className="text-base font-bold text-txt-primary tracking-tight font-mono">
            FLEET MACHINES
          </h2>
          <p className="text-xs text-txt-secondary font-mono">
            {machines.length} Industrial production machines monitored in real time
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID, name, bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          />

          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs"
          />

          {/* View Toggle */}
          <div className="flex bg-bg-primary p-0.5 rounded border border-surface-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-surface text-txt-primary font-bold shadow-subtle' : 'text-txt-secondary hover:text-txt-primary'}`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-surface text-txt-primary font-bold shadow-subtle' : 'text-txt-secondary hover:text-txt-primary'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Showing count */}
      <div className="flex items-center justify-between text-xs font-mono text-txt-muted">
        <span>Showing {filteredMachines.length} of {machines.length} machines</span>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-lg p-10 text-center font-mono text-xs text-txt-muted">
          No machines matched your search parameters.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-surface border border-surface-border rounded-lg overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-primary/80 border-b border-surface-border font-mono text-txt-secondary text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Machine ID</th>
                  <th className="py-2.5 px-4 font-semibold">Machine Name</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Hardware Sensors</th>
                  <th className="py-2.5 px-4 font-semibold">Healthy</th>
                  <th className="py-2.5 px-4 font-semibold">Warnings</th>
                  <th className="py-2.5 px-4 font-semibold">Faults</th>
                  <th className="py-2.5 px-4 font-semibold">Last Update</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 font-mono">
                {filteredMachines.map((m) => {
                  const modules = m.modules || [];
                  const stats = getMachineModuleStats(modules);
                  const isFault = stats.faults > 0;
                  const isWarning = stats.warnings > 0 && stats.faults === 0;
                  const isOffline = !m.isOnline;
                  const statusLabel = isFault ? 'FAULT' : isWarning ? 'WARNING' : isOffline ? 'OFFLINE' : 'ONLINE';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-hover/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/machines/${m.id}`)}
                    >
                      <td className="py-3 px-4 font-bold text-txt-primary">
                        {m.id}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-txt-primary">
                        <div>
                          <div>{m.name}</div>
                          <span className="text-[10px] font-mono text-txt-muted">{m.location}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={statusLabel} size="sm">
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-txt-secondary font-semibold">
                        {stats.total}
                      </td>
                      <td className="py-3 px-4 text-status-healthy font-semibold">
                        {stats.healthy}
                      </td>
                      <td className="py-3 px-4">
                        {stats.warnings > 0 ? (
                          <span className="text-status-warning font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {stats.warnings}
                          </span>
                        ) : (
                          <span className="text-txt-muted">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {stats.faults > 0 ? (
                          <span className="text-status-fault font-bold flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            {stats.faults}
                          </span>
                        ) : (
                          <span className="text-txt-muted">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-txt-muted text-[11px]">
                        {formatTimeAgo(m.lastUpdated)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/machines/${m.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover px-2.5 py-1 rounded hover:bg-surface-active transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map((m) => {
            const modules = m.modules || [];
            const stats = getMachineModuleStats(modules);
            const isFault = stats.faults > 0;
            const isWarning = stats.warnings > 0 && stats.faults === 0;
            const isOffline = !m.isOnline;
            const statusLabel = isFault ? 'FAULT' : isWarning ? 'WARNING' : isOffline ? 'OFFLINE' : 'ONLINE';

            return (
              <div
                key={m.id}
                className={clsx(
                  "bg-surface border rounded-lg p-4 flex flex-col justify-between shadow-subtle transition-all hover:border-txt-muted/40",
                  isFault ? "border-status-fault-border bg-status-fault-bg/10" :
                  isWarning ? "border-status-warning-border bg-status-warning-bg/10" :
                  "border-surface-border"
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-txt-primary">
                        {m.id}
                      </span>
                      <h4 className="text-xs font-semibold text-txt-secondary mt-0.5 truncate max-w-[180px]">
                        {m.name}
                      </h4>
                    </div>
                    <Badge status={statusLabel} size="sm">
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-1.5 font-mono text-xs border-t border-b border-surface-border/50 py-2.5">
                    <div className="flex justify-between text-txt-secondary">
                      <span>Modules</span>
                      <span className="font-semibold text-txt-primary">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Healthy</span>
                      <span className="font-semibold text-status-healthy">{stats.healthy}</span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Warnings</span>
                      <span className={stats.warnings > 0 ? "font-bold text-status-warning" : "text-txt-muted"}>
                        {stats.warnings}
                      </span>
                    </div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Faults</span>
                      <span className={stats.faults > 0 ? "font-bold text-status-fault" : "text-txt-muted"}>
                        {stats.faults}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-txt-muted">
                    {formatTimeAgo(m.lastUpdated)}
                  </span>
                  <button
                    onClick={() => navigate(`/machines/${m.id}`)}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>Open</span>
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
