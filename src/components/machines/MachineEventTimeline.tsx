import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MachineEvent } from '../../types/event';
import { formatTimeAgo } from '../../utils/formatting';
import { AlertTriangle, Info, AlertOctagon, CheckCircle, Clock } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface MachineEventTimelineProps {
  events: MachineEvent[];
  machineId: string;
}

export const MachineEventTimeline: React.FC<MachineEventTimelineProps> = ({ events, machineId }) => {
  const openEventDrawer = useUIStore((s) => s.openEventDrawer);

  const machineEvents = events.filter(e => e.machineId === machineId);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h3 className="text-base font-bold text-txt-primary">Machine Event & Alarm Timeline</h3>
        </div>
        <span className="text-xs font-mono text-txt-muted">{machineEvents.length} Recorded Events</span>
      </div>

      {machineEvents.length === 0 ? (
        <p className="text-xs text-txt-muted text-center py-8 font-mono">No events recorded for this machine.</p>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border">
          {machineEvents.map((evt) => {
            const Icon = evt.severity === 'ERROR' ? AlertOctagon : evt.severity === 'WARNING' ? AlertTriangle : Info;

            return (
              <div
                key={evt.id}
                onClick={() => openEventDrawer(evt.id)}
                className="relative bg-bg-primary/70 hover:bg-surface-hover border border-surface-border/70 rounded-lg p-3 transition-all cursor-pointer group"
              >
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[27px] top-3.5 w-5 h-5 rounded-full bg-surface border-2 border-surface-border flex items-center justify-center shrink-0">
                  <span className={`w-2 h-2 rounded-full ${evt.severity === 'ERROR' ? 'bg-rose-600' : evt.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={evt.severity} size="sm" />
                      <span className="font-mono text-xs font-bold text-txt-primary">{evt.type}</span>
                      <span className="text-[10px] font-mono text-txt-muted">({evt.formattedTime})</span>
                    </div>

                    <p className="text-xs font-sans text-txt-secondary leading-snug">
                      {evt.message}
                    </p>

                    {evt.value !== undefined && evt.threshold !== undefined && (
                      <div className="mt-2 text-[11px] font-mono bg-surface p-1.5 rounded border border-surface-border/60 inline-block text-txt-primary">
                        Recorded Value: <span className="font-bold text-rose-600">{evt.value} {evt.unit || ''}</span> • Limit: <span className="font-semibold">{evt.threshold} {evt.unit || ''}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-txt-muted shrink-0 group-hover:text-txt-primary transition-colors">
                    {formatTimeAgo(evt.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
