import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/Dashboard";
import { MachinesPage } from "./pages/Machines";
import { MachineDetailPage } from "./pages/MachineDetail";
import { ModulesPage } from "./pages/Modules";
import { ModuleDetailPage } from "./pages/ModuleDetail";
import { AlertsPage } from "./pages/Alerts";
import { SettingsPage } from "./pages/Settings";
import { ComparePage } from "./pages/Compare";
import { AnalyticsPage } from "./pages/Analytics";
import { ReportsPage } from "./pages/Reports";
import { EventsPage } from "./pages/Events";
import { useUIStore } from "./store/uiStore";

export const App: React.FC = () => {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    // Synchronize root theme class on startup
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
          <Route
            path="/machines/:machineId/modules/:moduleId"
            element={<ModuleDetailPage />}
          />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:moduleId" element={<ModuleDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Preserved secondary routes */}
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
