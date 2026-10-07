import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Bell, Sun, Moon, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useSimulationStore } from '../../store/simulationStore';
import { useMachineStore } from '../../store/machineStore';
import { useUIStore } from '../../store/uiStore';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { connectionStatus, lastSyncTime } = useSimulationStore();
  const { theme, toggleTheme } = useUIStore();
  const events = useMachineStore((s) => s.events);

  // Real-time seconds counter since last sync
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateTimeAgo = () => {
      const diffMs = Date.now() - new Date(lastSyncTime).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateTimeAgo();
    const timer = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  const activeAlertsCount = events.filter(e => e.severity === 'ERROR' || e.severity === 'WARNING').length;

  const getBreadcrumb = (path: string) => {
    if (path.startsWith('/dashboard')) return { section: 'Monitoring', title: 'Dashboard' };
    if (path.includes('/modules/')) return { section: 'Machines', title: 'Module Details & Management' };
    if (path.startsWith('/modules')) return { section: 'Monitoring', title: 'All Modules' };
    if (path.startsWith('/machines/')) return { section: 'Fleet', title: 'Machine Details' };
    if (path.startsWith('/machines')) return { section: 'Fleet', title: 'Machines Directory' };
    if (path.startsWith('/alerts') || path.startsWith('/events')) return { section: 'System', title: 'Alerts & Faults' };
    if (path.startsWith('/settings')) return { section: 'System', title: 'Settings' };
    return { section: 'Monitoring', title: 'Industrial System' };
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <header className="h-14 bg-surface border-b border-surface-border px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold text-txt-muted uppercase tracking-wider hidden sm:inline">
          {breadcrumb.section} /
        </span>
        <h1 className="text-sm sm:text-base font-bold text-txt-primary tracking-tight">
          {breadcrumb.title}
        </h1>
      </div>

      {/* Right Live Status & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Online / Live Telemetry Status */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {connectionStatus === 'LIVE' ? (
            <div className="flex items-center gap-2 bg-bg-primary px-2.5 py-1 rounded border border-surface-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-healthy opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-healthy"></span>
              </span>
              <span className="text-txt-primary font-bold text-[11px] tracking-wide">SYSTEM ONLINE</span>
              <span className="text-txt-muted text-[10px] hidden md:inline">
                • Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
              </span>
            </div>
          ) : connectionStatus === 'DEGRADED' ? (
            <Badge status="WARNING" size="sm">
              <AlertTriangle className="w-3 h-3 mr-1 inline" />
              DEGRADED
            </Badge>
          ) : (
            <Badge status="FAULT" size="sm">
              <WifiOff className="w-3 h-3 mr-1 inline" />
              OFFLINE
            </Badge>
          )}
        </div>

        <div className="h-4 w-[1px] bg-surface-border hidden sm:block" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Bell Link */}
        <NavLink
          to="/alerts"
          className="relative p-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
          title="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-status-fault text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-surface">
              {activeAlertsCount > 99 ? '99+' : activeAlertsCount}
            </span>
          )}
        </NavLink>
      </div>
    </header>
  );
};
