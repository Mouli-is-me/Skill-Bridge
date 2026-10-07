import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MachineEvent } from '../../types/event';
import { Machine } from '../../types/machine';
import { formatDateShort, formatTimeAgo } from '../../utils/formatting';
import { ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: MachineEvent | null;
  machine?: Machine;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  isOpen,
  onClose,
  event,
  machine
}) => {
  const navigate = useNavigate();

  if (!event) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Event Diagnostic Inspection"
      subtitle={`Event ID: ${event.id}`}
    >
      <div className="space-y-6 text-xs font-mono">
        {/* Severity Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl border bg-bg-primary/80 border-surface-border">
          <div className="flex items-center gap-3">
            <Badge status={event.severity} size="lg" />
            <div>
              <span className="font-bold text-sm text-txt-primary block font-sans">{event.type}</span>
              <span className="text-txt-muted text-[11px]">{formatDateShort(event.timestamp)} ({formatTimeAgo(event.timestamp)})</span>
            </div>
          </div>
        </div>

        {/* Machine Info Card */}
        <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-surface-border pb-2 font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="font-extrabold text-sm text-txt-primary">{event.machineId}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                navigate(`/machines/${event.machineId}`);
              }}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open Machine
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div>
              <span className="text-[10px] text-txt-muted uppercase">Machine Name</span>
              <span className="block font-bold text-txt-primary">{event.machineName}</span>
            </div>
            <div>
              <span className="text-[10px] text-txt-muted uppercase">Location</span>
              <span className="block font-bold text-txt-primary">{machine?.location || 'Production Line'}</span>
            </div>
          </div>
        </div>

        {/* Message Payload */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider block">
            Telemetry Diagnostic Message
          </label>
          <div className="bg-bg-primary border border-surface-border p-3.5 rounded-lg text-txt-primary font-sans leading-relaxed text-xs">
            {event.message}
          </div>
        </div>

        {/* Metric Threshold Comparison */}
        {event.value !== undefined && event.threshold !== undefined && (
          <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider block font-mono">
              Threshold Delta Assessment
            </span>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-bg-primary p-3 rounded-lg border border-surface-border">
                <span className="text-[10px] text-txt-muted uppercase block">Trigger Value</span>
                <span className="text-lg font-bold text-rose-600 block mt-0.5">
                  {event.value} {event.unit || ''}
                </span>
              </div>
              <div className="bg-bg-primary p-3 rounded-lg border border-surface-border">
                <span className="text-[10px] text-txt-muted uppercase block">Configured Threshold</span>
                <span className="text-lg font-bold text-txt-primary block mt-0.5">
                  {event.threshold} {event.unit || ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
