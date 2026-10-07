import React from 'react';
import { MachineEvent } from '../../types/event';
import { Badge } from '../ui/Badge';
import { formatTimeAgo, formatDateShort } from '../../utils/formatting';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface EventTableProps {
  events: MachineEvent[];
  onSelectEvent: (eventId: string) => void;
}

export const EventTable: React.FC<EventTableProps> = ({ events, onSelectEvent }) => {
  if (events.length === 0) {
    return (
      <div className="bg-surface border border-surface-border rounded-xl p-12 text-center text-xs font-mono text-txt-muted">
        No events recorded matching criteria.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-bg-primary border-b border-surface-border uppercase text-[10px] font-bold text-txt-secondary tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Asset ID</th>
              <th className="py-3 px-4">Event Category</th>
              <th className="py-3 px-4">Log Description</th>
              <th className="py-3 px-4 text-right">Reading / Limit</th>
              <th className="py-3 px-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {events.map((evt) => (
              <tr
                key={evt.id}
                onClick={() => onSelectEvent(evt.id)}
                className="hover:bg-surface-hover transition-colors cursor-pointer group"
              >
                <td className="py-3 px-4 text-txt-secondary whitespace-nowrap">
                  {formatDateShort(evt.timestamp)}
                </td>
                <td className="py-3 px-4">
                  <Badge status={evt.severity} size="sm" />
                </td>
                <td className="py-3 px-4 font-bold text-txt-primary">
                  {evt.machineId}
                </td>
                <td className="py-3 px-4 font-semibold text-txt-secondary">
                  {evt.type}
                </td>
                <td className="py-3 px-4 font-sans text-txt-primary max-w-[320px] truncate" title={evt.message}>
                  {evt.message}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                  {evt.value !== undefined ? (
                    <span className={clsx(evt.severity === 'ERROR' ? "text-rose-600" : evt.severity === 'WARNING' ? "text-amber-600" : "text-txt-primary")}>
                      {evt.value} / {evt.threshold || '-'} {evt.unit || ''}
                    </span>
                  ) : (
                    <span className="text-txt-muted">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="p-1 rounded text-txt-muted group-hover:text-txt-primary transition-colors inline-block">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
