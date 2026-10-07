import React from 'react';
import { Card } from '../ui/Card';
import { useUIStore } from '../../store/uiStore';
import { Sun, Moon, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useUIStore();

  return (
    <Card className="space-y-4">
      <div className="border-b border-surface-border pb-3">
        <h3 className="text-base font-bold text-txt-primary">Appearance & Industrial Theme Settings</h3>
        <p className="text-xs text-txt-secondary font-mono">Toggle between Light Industrial theme and Dark Charcoal theme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Light Theme Option */}
        <div
          onClick={() => setTheme('light')}
          className={clsx(
            "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3",
            theme === 'light'
              ? "bg-emerald-500/10 border-accent ring-2 ring-accent"
              : "bg-surface border-surface-border hover:bg-surface-hover"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm text-txt-primary font-mono">Light Industrial</span>
            </div>
            {theme === 'light' && (
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <p className="text-xs text-txt-secondary font-sans">
            Calm, high-contrast light background (#F5F6F4) optimized for bright factory control rooms.
          </p>
        </div>

        {/* Dark Theme Option */}
        <div
          onClick={() => setTheme('dark')}
          className={clsx(
            "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3",
            theme === 'dark'
              ? "bg-emerald-500/10 border-accent ring-2 ring-accent"
              : "bg-surface border-surface-border hover:bg-surface-hover"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm text-txt-primary font-mono">Dark Charcoal</span>
            </div>
            {theme === 'dark' && (
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <p className="text-xs text-txt-secondary font-sans">
            Technical charcoal dark theme (#121513) engineered to avoid pure black glow and reduce eye strain.
          </p>
        </div>
      </div>
    </Card>
  );
};
