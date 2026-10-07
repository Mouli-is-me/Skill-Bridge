import { Machine, HistoricalMachineData } from '../types/machine';
import { MachineEvent } from '../types/event';
import { KpiOverview } from '../types/kpi';
import { useMachineStore } from '../store/machineStore';
import { calculateOEE } from '../utils/calculations';

// Mock REST API service layer abstraction
export const api = {
  async getMachines(): Promise<Machine[]> {
    return useMachineStore.getState().machines;
  },

  async getMachineById(id: string): Promise<Machine | undefined> {
    return useMachineStore.getState().machines.find(m => m.id === id);
  },

  async getMachineHistory(id: string): Promise<HistoricalMachineData | undefined> {
    return useMachineStore.getState().historyMap[id];
  },

  async getEvents(): Promise<MachineEvent[]> {
    return useMachineStore.getState().events;
  },

  async getKpiOverview(): Promise<KpiOverview> {
    const machines = useMachineStore.getState().machines;
    const running = machines.filter(m => m.status === 'RUNNING').length;
    const warning = machines.filter(m => m.status === 'WARNING').length;
    const error = machines.filter(m => m.status === 'ERROR').length;
    const idle = machines.filter(m => m.status === 'IDLE').length;

    const avgUtil = machines.reduce((acc, m) => acc + m.metrics.utilization, 0) / (machines.length || 1);
    const totalProd = machines.reduce((acc, m) => acc + m.metrics.production, 0);

    const avgOee = machines.reduce((acc, m) => acc + m.metrics.oee, 0) / (machines.length || 1);
    const downtime = error * 2.5 + idle * 1.5;

    return {
      totalMachines: machines.length,
      runningCount: running,
      warningCount: warning,
      errorCount: error,
      idleCount: idle,
      utilizationRate: Number(avgUtil.toFixed(1)),
      utilizationDelta: 2.4, // % vs yesterday
      totalProduction: Math.round(totalProd),
      productionDelta: 4.1,
      downtimeHours: Number(downtime.toFixed(1)),
      downtimeDelta: -12.5, // -12.5% downtime is good!
      oee: Number(avgOee.toFixed(1)),
      oeeDelta: 1.8,
      availability: 94.2,
      performance: 89.6,
      quality: 98.4
    };
  }
};
