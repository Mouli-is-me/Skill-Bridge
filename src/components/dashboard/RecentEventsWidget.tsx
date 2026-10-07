import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MachineEvent } from '../../types/event';
import { formatTimeAgo } from '../../utils/formatting';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface RecentEventsWidgetProps {
  events: MachineEvent[];
}

export const RecentEventsWidget: React.FC<RecentEventsWidgetProps> = ({ events }) => {
  const navigate = useNavigate();
  const openEventDrawer = useUIStore((s) => s.openEventDrawer);

  const displayEvents = events.slice(0, 6);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-txt-primary">Recent Machine & System Events</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/events')}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Log
        </Button>
      </div>

      {displayEvents.length === 0 ? (
        <p className="text-xs text-txt-muted text-center py-6">No events recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {displayEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => openEventDrawer(evt.id)}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/70 hover:bg-surface-hover border border-surface-border/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Badge status={evt.severity} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-txt-primary">{evt.machineId}</span>
                    <span className="text-txt-muted">•</span>
                    <span className="text-txt-secondary font-sans truncate">{evt.message}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-txt-muted shrink-0 ml-2 group-hover:text-txt-primary transition-colors">
                {formatTimeAgo(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
