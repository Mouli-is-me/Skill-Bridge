import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Layers,
  AlertTriangle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../store/uiStore';
import { useMachineStore } from '../../store/machineStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const events = useMachineStore((s) => s.events);
  
  // Count active warnings and faults for alert badge
  const activeAlertsCount = events.filter(e => e.severity === 'ERROR' || e.severity === 'WARNING').length;

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Machines', path: '/machines', icon: Cpu },
    { name: 'Modules', path: '/modules', icon: Layers },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badgeCount: activeAlertsCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        "bg-surface border-r border-surface-border flex flex-col transition-all duration-200 z-30 shrink-0 select-none",
        isSidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-surface-border">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white shrink-0 font-bold shadow-subtle">
            <Activity className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xs tracking-tight text-txt-primary uppercase font-mono">SKILL BRIDGE</span>
              <span className="text-[9px] text-txt-secondary font-medium tracking-wider uppercase mt-0.5">Monitoring System</span>
            </div>
          )}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-txt-muted hover:text-txt-primary hover:bg-surface-hover hidden md:block transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all relative group",
                    isActive
                      ? "bg-accent-subtle text-accent font-bold border border-accent/20"
                      : "text-txt-secondary hover:text-txt-primary hover:bg-surface-hover border border-transparent"
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Badge */}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span
                    className={clsx(
                      "ml-auto text-[10px] font-mono font-bold px-1.5 py-0.2 rounded",
                      isSidebarCollapsed
                        ? "absolute top-1 right-1 px-1 py-0 text-[9px] bg-rose-600 text-white"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {item.badgeCount}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Strip */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-t border-surface-border bg-bg-primary/30 text-[10px] text-txt-muted font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-healthy inline-block" />
            <span className="text-txt-secondary font-semibold">SYSTEM ONLINE</span>
          </div>
          <span>v2.4.0</span>
        </div>
      )}
    </aside>
  );
};
