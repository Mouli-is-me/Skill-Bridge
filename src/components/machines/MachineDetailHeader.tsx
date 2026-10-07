import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { ChevronLeft, Zap, Download, PlusCircle } from 'lucide-react';
import { useMachineStore } from '../../store/machineStore';
import { downloadCSV } from '../../utils/csvExport';

interface MachineDetailHeaderProps {
  machine: Machine;
}

export const MachineDetailHeader: React.FC<MachineDetailHeaderProps> = ({ machine }) => {
  const navigate = useNavigate();
  const injectEvent = useMachineStore((s) => s.injectEvent);

  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [eventType, setEventType] = useState<string>('TEMP_EXCEEDED');
  const [severity, setSeverity] = useState<string>('WARNING');
  const [customMsg, setCustomMsg] = useState<string>('');

  const handleInject = () => {
    let msg = customMsg;
    if (!msg) {
      if (eventType === 'TEMP_EXCEEDED') msg = `Manual simulation: Temperature spiked to 86.5°C`;
      else if (eventType === 'VIB_HIGH') msg = `Manual simulation: Vibration level hit 6.8 mm/s`;
      else if (eventType === 'MACHINE_STOPPED') msg = `Manual emergency stop command issued by operator`;
      else msg = `Manual test event injected for ${machine.name}`;
    }

    injectEvent({
      machineId: machine.id,
      machineName: machine.name,
      severity: severity as any,
      type: eventType as any,
      message: msg,
      value: eventType === 'TEMP_EXCEEDED' ? 86.5 : eventType === 'VIB_HIGH' ? 6.8 : 0,
      threshold: eventType === 'TEMP_EXCEEDED' ? machine.thresholds.tempWarning : machine.thresholds.vibWarning
    });

    setIsInjectModalOpen(false);
    setCustomMsg('');
  };

  const handleExportData = () => {
    const history = useMachineStore.getState().historyMap[machine.id];
    if (!history || !history.hourlyPoints) return;

    const exportRows = history.hourlyPoints.map(p => ({
      Timestamp: p.timestamp,
      MachineID: machine.id,
      MachineName: machine.name,
      RPM: p.rpm,
      Temperature_C: p.temperature,
      Vibration_mms: p.vibration,
      Current_A: p.current,
      Utilization_Pct: p.utilization,
      Production_Units: p.production
    }));

    downloadCSV(`${machine.id}_telemetry_export.csv`, exportRows);
  };

  return (
    <div className="bg-surface border border-surface-border p-5 rounded-xl shadow-subtle space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info & Back Link */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/machines')}
            className="p-2 rounded-lg bg-bg-primary hover:bg-surface-hover border border-surface-border text-txt-secondary hover:text-txt-primary transition-colors shrink-0 mt-0.5"
            title="Back to fleet directory"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-txt-primary">{machine.id}</h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-bg-tertiary text-txt-secondary rounded">
                {machine.type}
              </span>
              <Badge status={machine.status} size="md" />
            </div>

            <h3 className="text-sm font-semibold text-txt-secondary mt-0.5">
              {machine.name} • <span className="font-mono text-xs">{machine.model}</span>
            </h3>

            <p className="text-xs text-txt-muted font-mono mt-1">
              Location: {machine.location} ({machine.section}) • Installed: {machine.installedDate}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInjectModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4 text-amber-500" />}
          >
            Inject Event
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportData}
            icon={<Download className="w-4 h-4" />}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Manual Inject Event Modal */}
      <Modal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        title={`Inject Simulated Event (${machine.id})`}
        subtitle="Simulate a threshold anomaly or operational state trigger"
      >
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-xs font-bold text-txt-secondary mb-1">Event Severity</label>
            <Select
              options={[
                { label: 'WARNING', value: 'WARNING' },
                { label: 'ERROR', value: 'ERROR' },
                { label: 'INFO', value: 'INFO' }
              ]}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-secondary mb-1">Event Category</label>
            <Select
              options={[
                { label: 'Temperature Exceeded (TEMP_EXCEEDED)', value: 'TEMP_EXCEEDED' },
                { label: 'Vibration High (VIB_HIGH)', value: 'VIB_HIGH' },
                { label: 'Machine Stopped (MACHINE_STOPPED)', value: 'MACHINE_STOPPED' },
                { label: 'Restarted (RESTARTED)', value: 'RESTARTED' },
                { label: 'Maintenance Activity (MAINTENANCE)', value: 'MAINTENANCE' }
              ]}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-secondary mb-1">Custom Log Message (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bearing friction temperature spike"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full bg-bg-primary text-txt-primary border border-surface-border rounded-md px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsInjectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleInject}>Trigger Event Now</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
