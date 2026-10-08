import React, { useState } from "react";
import { useMachineStore } from "../store/machineStore";
import { KPIGrid } from "../components/analytics/KPIGrid";
import { UtilizationChart } from "../components/analytics/UtilizationChart";
import { DowntimeChart } from "../components/analytics/DowntimeChart";
import { PerformanceRanking } from "../components/analytics/PerformanceRanking";
import { Tabs } from "../components/ui/Tabs";

export const AnalyticsPage: React.FC = () => {
  const machines = useMachineStore((s) => s.machines);
  const [periodTrend, setPeriodTrend] = useState<string>("Daily");

  const periodTabs = [
    { id: "Daily", label: "Daily Trend" },
    { id: "Weekly", label: "Weekly Trend" },
    { id: "Monthly", label: "Monthly Trend" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-surface-border p-3.5 rounded-md">
        <div>
          <h2 className="text-sm font-bold text-txt-primary tracking-tight font-mono">
            OEE & PERFORMANCE ANALYTICS
          </h2>
          <p className="text-[11px] text-txt-secondary font-mono">
            Equipment efficiency scores, downtime distribution, and fleet benchmarks
          </p>
        </div>

        <Tabs
          tabs={periodTabs}
          activeTab={periodTrend}
          onChange={setPeriodTrend}
        />
      </div>

      {/* Top OEE KPI Cards Grid */}
      <KPIGrid />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UtilizationChart machines={machines} />
        <DowntimeChart />
      </div>

      {/* Performance Ranking */}
      <PerformanceRanking machines={machines} />
    </div>
  );
};
