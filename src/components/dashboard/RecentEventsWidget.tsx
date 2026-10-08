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
    <Card className="space-y-3" padding="md">
      <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-semibold text-txt-primary">Recent Machine & System Events</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/events')}
          icon={<ArrowRight className="w-3 h-3" />}
        >
          View Log
        </Button>
      </div>

      {displayEvents.length === 0 ? (
        <p className="text-xs text-txt-muted text-center py-4 font-mono">No events recorded yet.</p>
      ) : (
        <div className="space-y-1.5">
          {displayEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => openEventDrawer(evt.id)}
              className="flex items-center justify-between p-2 rounded-xs bg-bg-primary/50 hover:bg-surface-hover border border-surface-border transition-all cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Badge status={evt.severity} size="sm" />
                <div className="min-w-0 flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-txt-primary">{evt.machineId}</span>
                  <span className="text-txt-muted">•</span>
                  <span className="text-txt-secondary font-sans truncate text-xs">{evt.message}</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-txt-muted shrink-0 ml-2 group-hover:text-txt-primary transition-colors">
                {formatTimeAgo(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
