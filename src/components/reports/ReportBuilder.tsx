import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Machine } from '../../types/machine';
import { FileText, Download, Printer } from 'lucide-react';

interface ReportBuilderProps {
  period: string;
  onSetPeriod: (p: string) => void;
  machineScope: string;
  onSetMachineScope: (m: string) => void;
  machines: Machine[];
  onGenerate: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  period,
  onSetPeriod,
  machineScope,
  onSetMachineScope,
  machines,
  onGenerate,
  onExportCSV,
  onExportPDF
}) => {
  const periodOptions = [
    { label: 'Current Shift (8 Hours)', value: 'SHIFT' },
    { label: 'Today (24 Hours)', value: 'TODAY' },
    { label: 'Past 7 Days', value: '7D' },
    { label: 'Past 30 Days', value: '30D' }
  ];

  const machineScopeOptions = [
    { label: 'All Fleet Machines', value: 'ALL' },
    ...machines.map(m => ({ label: `${m.id} - ${m.name}`, value: m.id }))
  ];

  return (
    <Card className="no-print space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-base font-bold text-txt-primary">Report Configuration</h3>
          <p className="text-xs text-txt-secondary font-mono">Select shift parameters and scope to compile executive summary</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={onGenerate} icon={<FileText className="w-4 h-4" />}>
            Generate Report
          </Button>

          <Button variant="secondary" onClick={onExportCSV} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>

          <Button variant="outline" onClick={onExportPDF} icon={<Printer className="w-4 h-4" />}>
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Time Period Scope"
          options={periodOptions}
          value={period}
          onChange={(e) => onSetPeriod(e.target.value)}
          className="w-full"
        />

        <Select
          label="Machine Asset Scope"
          options={machineScopeOptions}
          value={machineScope}
          onChange={(e) => onSetMachineScope(e.target.value)}
          className="w-full"
        />
      </div>
    </Card>
  );
};
