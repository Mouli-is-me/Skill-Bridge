import React, { useState } from "react";
import { useMachineStore } from "../store/machineStore";
import { ReportBuilder } from "../components/reports/ReportBuilder";
import { ReportPreview } from "../components/reports/ReportPreview";
import { downloadCSV } from "../utils/csvExport";
import { triggerPDFPrint } from "../utils/pdfExport";

export const ReportsPage: React.FC = () => {
  const { machines, events } = useMachineStore();

  const [period, setPeriod] = useState<string>("SHIFT");
  const [machineScope, setMachineScope] = useState<string>("ALL");
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  const handleExportCSV = () => {
    const targetMachines =
      machineScope === "ALL"
        ? machines
        : machines.filter((m) => m.id === machineScope);
    const rows = targetMachines.map((m) => ({
      MachineID: m.id,
      Name: m.name,
      Type: m.type,
      Location: m.location,
      Status: m.status,
      RPM: m.metrics.rpm,
      Temperature: m.metrics.temperature,
      Vibration: m.metrics.vibration,
      Utilization: m.metrics.utilization,
      Production: m.metrics.production,
      OEE: m.metrics.oee,
    }));

    downloadCSV(
      `skill_bridge_report_${period.toLowerCase()}_${machineScope.toLowerCase()}.csv`,
      rows,
    );
  };

  const handleExportPDF = () => {
    triggerPDFPrint("Skill Bridge Shift Report");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface border border-surface-border p-3.5 rounded-md no-print">
        <h2 className="text-sm font-bold text-txt-primary tracking-tight font-mono">
          SHIFT & OPERATIONAL REPORTS
        </h2>
        <p className="text-[11px] text-txt-secondary font-mono">
          Compile operational performance metrics and shift summaries
        </p>
      </div>

      {/* Report Options Builder */}
      <ReportBuilder
        period={period}
        onSetPeriod={setPeriod}
        machineScope={machineScope}
        onSetMachineScope={setMachineScope}
        machines={machines}
        onGenerate={handleGenerate}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Live Preview Document */}
      {isGenerated && (
        <ReportPreview
          period={period}
          machineScope={machineScope}
          machines={machines}
          events={events}
        />
      )}
    </div>
  );
};
