import React, { useState, useMemo } from 'react';
import { useMachineStore } from '../store/machineStore';
import { useUIStore } from '../store/uiStore';
import { EventFilters } from '../components/events/EventFilters';
import { EventTable } from '../components/events/EventTable';
import { EventDetailDrawer } from '../components/events/EventDetailDrawer';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

export const EventsPage: React.FC = () => {
  const { events, machines } = useMachineStore();
  const { activeEventDrawerId, openEventDrawer, closeEventDrawer } = useUIStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [machineFilter, setMachineFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesMachine = machineFilter === 'ALL' || e.machineId === machineFilter;
      const matchesType = typeFilter === 'ALL' || e.type === typeFilter;

      return matchesSearch && matchesSeverity && matchesMachine && matchesType;
    });
  }, [events, searchQuery, severityFilter, machineFilter, typeFilter]);

  const selectedEvent = events.find(e => e.id === activeEventDrawerId) || null;
  const targetMachine = selectedEvent ? machines.find(m => m.id === selectedEvent.machineId) : undefined;

  const handleExportEventsCSV = () => {
    const rows = filteredEvents.map(e => ({
      EventID: e.id,
      Timestamp: e.timestamp,
      Severity: e.severity,
      MachineID: e.machineId,
      MachineName: e.machineName,
      Type: e.type,
      Message: e.message,
      Value: e.value || '',
      Threshold: e.threshold || ''
    }));

    downloadCSV(`skill_bridge_events_log.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-surface-border p-4 rounded-xl shadow-subtle">
        <div>
          <h2 className="text-xl font-extrabold text-txt-primary tracking-tight">System Event Audit Log</h2>
          <p className="text-xs text-txt-secondary font-mono">
            Full audit trail of operational warnings, errors, and threshold alarms
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleExportEventsCSV}
          icon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <EventFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        machineFilter={machineFilter}
        onMachineChange={setMachineFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        machines={machines}
      />

      {/* Audit Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-txt-muted">
          <span>Showing {filteredEvents.length} of {events.length} total events</span>
        </div>

        <EventTable
          events={filteredEvents}
          onSelectEvent={(id) => openEventDrawer(id)}
        />
      </div>

      {/* Slide-over Detail Drawer */}
      <EventDetailDrawer
        isOpen={activeEventDrawerId !== null}
        onClose={closeEventDrawer}
        event={selectedEvent}
        machine={targetMachine}
      />
    </div>
  );
};
