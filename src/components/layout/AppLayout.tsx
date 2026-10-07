import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useSimulationStore } from '../../store/simulationStore';
import { startSimulationEngine } from '../../services/simulationEngine';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const AppLayout: React.FC = () => {
  const { connectionStatus, retryConnection } = useSimulationStore();

  useEffect(() => {
    // Start live simulator ticker on mount
    startSimulationEngine(1500);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-txt-primary">
      {/* Sidebar - Desktop & Tablet */}
      <div className="hidden md:flex flex-col h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <TopBar />

        {/* Connection Outage / Offline Warning Banner */}
        {(connectionStatus === 'CONNECTION_LOST' || connectionStatus === 'OFFLINE') && (
          <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shrink-0 z-30 shadow-md">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse" />
              <span>Telemetry connection lost. Displaying cached operational data.</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={retryConnection}
              icon={<RefreshCw className="w-3 h-3 text-txt-primary" />}
              className="text-xs font-bold"
            >
              Re-establish Link
            </Button>
          </div>
        )}

        {/* Page Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 space-y-6">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};
