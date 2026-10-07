import React from 'react';
import { Card } from '../ui/Card';
import { Machine } from '../../types/machine';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { Trophy, AlertOctagon } from 'lucide-react';

interface PerformanceRankingProps {
  machines: Machine[];
}

export const PerformanceRanking: React.FC<PerformanceRankingProps> = ({ machines }) => {
  const navigate = useNavigate();

  // Sort by utilization & OEE
  const sorted = [...machines].sort((a, b) => b.metrics.utilization - a.metrics.utilization);
  const topPerformers = sorted.slice(0, 3);
  const bottomPerformers = [...sorted].reverse().slice(0, 3);

  return (
    <Card className="space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-bold text-txt-primary">Fleet Performance Asset Ranking</h3>
        <p className="text-xs text-txt-secondary font-mono">Top efficient assets vs. bottleneck machines requiring intervention</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Top 3 Performers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">
            <Trophy className="w-4 h-4" />
            <span>Top Performing Assets</span>
          </div>
          <div className="space-y-2">
            {topPerformers.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => navigate(`/machines/${m.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/80 hover:bg-surface-hover border border-surface-border transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-txt-primary block">{m.id} - {m.name}</span>
                    <span className="text-[10px] text-txt-muted font-sans">{m.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block text-sm">
                    {m.metrics.utilization.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-txt-muted">{m.metrics.production} u/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 3 Bottlenecks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-xs">
            <AlertOctagon className="w-4 h-4" />
            <span>Operational Bottlenecks</span>
          </div>
          <div className="space-y-2">
            {bottomPerformers.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => navigate(`/machines/${m.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/80 hover:bg-surface-hover border border-surface-border transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                    #{machines.length - idx}
                  </span>
                  <div>
                    <span className="font-bold text-txt-primary block">{m.id} - {m.name}</span>
                    <Badge status={m.status} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-sm">
                    {m.metrics.utilization.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-txt-muted">{m.metrics.production} u/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
