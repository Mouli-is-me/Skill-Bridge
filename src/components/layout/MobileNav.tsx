import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  Settings 
} from 'lucide-react';
import { clsx } from 'clsx';
import { useMachineStore } from '../../store/machineStore';

export const MobileNav: React.FC = () => {
  const events = useMachineStore((s) => s.events);
  const activeAlertsCount = events.filter(e => e.severity === 'ERROR' || e.severity === 'WARNING').length;

  const items = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Machines', path: '/machines', icon: Cpu },
    { name: 'Modules', path: '/modules', icon: Layers },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: activeAlertsCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-13 bg-surface border-t border-surface-border flex items-center justify-around z-40 px-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative",
                isActive ? "text-txt-primary font-semibold" : "text-txt-muted hover:text-txt-secondary"
              )
            }
          >
            <Icon className="w-3.5 h-3.5 mb-0.5 stroke-[1.8]" />
            <span className="truncate">{item.name}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-rose-600 text-white font-mono text-[8px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
};
