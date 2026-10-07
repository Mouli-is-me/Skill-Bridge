import { create } from 'zustand';
import { Machine, MachineThresholds, HistoricalMachineData, MetricTimeSeriesPoint } from '../types/machine';
import { MachineModule, ModuleConfig } from '../types/module';
import { MachineEvent } from '../types/event';
import { INITIAL_MACHINES } from '../services/initialMachines';
import { generate30DayHistory } from '../services/historicalDataGenerator';
import { evaluateMachineThresholds } from '../services/thresholdEngine';

interface MachineState {
  machines: Machine[];
  historyMap: Record<string, HistoricalMachineData>;
  events: MachineEvent[];
  selectedMachineId: string | null;
  
  // Actions
  setMachines: (machines: Machine[]) => void;
  updateMachineMetrics: (machineId: string, newMetricsPartial: Partial<Machine['metrics']>) => void;
  updateMachineThresholds: (machineId: string, newThresholds: MachineThresholds) => void;
  updateModuleConfig: (machineId: string, moduleId: string, config: Partial<ModuleConfig>) => void;
  updateModuleThresholds: (machineId: string, moduleId: string, warning: number, critical: number) => void;
  setModuleEnabled: (machineId: string, moduleId: string, enabled: boolean) => void;
  setModuleDataCollection: (machineId: string, moduleId: string, dataCollection: boolean) => void;
  injectEvent: (event: Omit<MachineEvent, 'id' | 'timestamp' | 'formattedTime'>) => void;
  appendRealtimeTimeSeriesPoint: (machineId: string, point: MetricTimeSeriesPoint) => void;
  reseedHistory: () => void;
  resetAll: () => void;
  selectMachine: (id: string | null) => void;
}

const initialHistory = generate30DayHistory(INITIAL_MACHINES);

// Initial seed events for realistic display on first load
const initialEvents: MachineEvent[] = [
  {
    id: 'evt-m03-seed-1',
    machineId: 'M-03',
    machineName: 'Rapier Loom B1',
    moduleId: 'M03-DS18B20',
    moduleName: 'DS18B20',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    formattedTime: new Date(Date.now() - 120000).toLocaleTimeString('en-US', { hour12: false }),
    severity: 'WARNING',
    type: 'TEMP_EXCEEDED',
    message: 'High temperature detected on DS18B20: 78.4°C (Limit: 75.0°C)',
    metricName: 'temperature',
    value: 78.4,
    threshold: 75.0,
    unit: '°C'
  },
  {
    id: 'evt-m02-seed-2',
    machineId: 'M-02',
    machineName: 'Air-Jet Loom A2',
    moduleId: 'M02-MPU6050',
    moduleName: 'MPU6050',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    formattedTime: new Date(Date.now() - 480000).toLocaleTimeString('en-US', { hour12: false }),
    severity: 'WARNING',
    type: 'VIB_HIGH',
    message: 'MPU6050 Acceleration X approaching threshold: 1.85 g (Limit: 2.00 g)',
    metricName: 'accelX',
    value: 1.85,
    threshold: 2.0,
    unit: 'g'
  },
  {
    id: 'evt-m03-seed-3',
    machineId: 'M-03',
    machineName: 'Rapier Loom B1',
    moduleId: 'M03-MPU6050',
    moduleName: 'MPU6050',
    timestamp: new Date(Date.now() - 1440000).toISOString(),
    formattedTime: new Date(Date.now() - 1440000).toLocaleTimeString('en-US', { hour12: false }),
    severity: 'WARNING',
    type: 'VIB_HIGH',
    message: 'Elevated MPU6050 frame motion: 2.15 g (Limit: 2.00 g)',
    metricName: 'accelX',
    value: 2.15,
    threshold: 2.0,
    unit: 'g'
  },
  {
    id: 'evt-m10-seed-4',
    machineId: 'M-10',
    machineName: 'Compact Spinning S4',
    moduleId: 'M10-LM393',
    moduleName: 'LM393',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    formattedTime: new Date(Date.now() - 7200000).toLocaleTimeString('en-US', { hour12: false }),
    severity: 'INFO',
    type: 'MACHINE_STOPPED',
    message: 'LM393 pulse detection stopped (Scheduled maintenance)',
    metricName: 'pulseFrequency',
    value: 0,
    threshold: 0,
    unit: 'Hz'
  }
];

export const useMachineStore = create<MachineState>((set, get) => ({
  machines: INITIAL_MACHINES,
  historyMap: initialHistory,
  events: initialEvents,
  selectedMachineId: 'M-03',

  setMachines: (machines) => set({ machines }),

  updateMachineMetrics: (machineId, newMetricsPartial) => {
    const { machines, events } = get();
    const targetMachine = machines.find(m => m.id === machineId);
    if (!targetMachine) return;

    const updatedMetrics = { ...targetMachine.metrics, ...newMetricsPartial };
    const tempMachine: Machine = { ...targetMachine, metrics: updatedMetrics };

    // Evaluate against dynamic thresholds
    const { updatedMachine, newEvents } = evaluateMachineThresholds(tempMachine, events);

    set({
      machines: machines.map(m => m.id === machineId ? updatedMachine : m),
      events: newEvents.length > 0 ? [...newEvents, ...events] : events
    });
  },

  updateMachineThresholds: (machineId, newThresholds) => {
    const { machines, events } = get();
    const updatedMachines = machines.map(m => {
      if (m.id === machineId) {
        const updated = { ...m, thresholds: newThresholds };
        const { updatedMachine } = evaluateMachineThresholds(updated, events);
        return updatedMachine;
      }
      return m;
    });

    const target = updatedMachines.find(m => m.id === machineId);
    const systemEvt: MachineEvent = {
      id: `evt-${machineId}-${Date.now()}-thresh-upd`,
      machineId,
      machineName: target?.name || machineId,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      severity: 'INFO',
      type: 'THRESHOLD_UPDATED',
      message: `Updated operational thresholds for ${target?.name || machineId}`
    };

    set({
      machines: updatedMachines,
      events: [systemEvt, ...events]
    });
  },

  updateModuleConfig: (machineId, moduleId, configPartial) => {
    const { machines, events } = get();
    const updatedMachines = machines.map(m => {
      if (m.id === machineId) {
        const updatedMods = (m.modules || []).map(mod => {
          if (mod.id === moduleId) {
            return {
              ...mod,
              config: { ...mod.config, ...configPartial }
            };
          }
          return mod;
        });
        const { updatedMachine } = evaluateMachineThresholds({ ...m, modules: updatedMods }, events);
        return updatedMachine;
      }
      return m;
    });

    set({ machines: updatedMachines });
  },

  updateModuleThresholds: (machineId, moduleId, warning, critical) => {
    const { machines, events } = get();
    const updatedMachines = machines.map(m => {
      if (m.id === machineId) {
        const updatedMods = (m.modules || []).map(mod => {
          if (mod.id === moduleId) {
            const updatedSensors = mod.sensors.map(s => {
              if (s.key === mod.config.primarySensorKey || s.id.includes('temp') || s.id.includes('vib')) {
                return {
                  ...s,
                  warningThreshold: warning,
                  criticalThreshold: critical
                };
              }
              return s;
            });
            return {
              ...mod,
              config: {
                ...mod.config,
                warningThreshold: warning,
                criticalThreshold: critical
              },
              sensors: updatedSensors
            };
          }
          return mod;
        });
        const { updatedMachine } = evaluateMachineThresholds({ ...m, modules: updatedMods }, events);
        return updatedMachine;
      }
      return m;
    });

    const targetMachine = updatedMachines.find(m => m.id === machineId);
    const targetMod = targetMachine?.modules.find(mod => mod.id === moduleId);

    const systemEvt: MachineEvent = {
      id: `evt-${moduleId}-${Date.now()}-mod-thresh`,
      machineId,
      machineName: targetMachine?.name || machineId,
      moduleId,
      moduleName: targetMod?.name || moduleId,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      severity: 'INFO',
      type: 'THRESHOLD_UPDATED',
      message: `Updated module thresholds for ${targetMod?.name || moduleId} (Warn: ${warning}, Crit: ${critical})`
    };

    set({
      machines: updatedMachines,
      events: [systemEvt, ...events]
    });
  },

  setModuleEnabled: (machineId, moduleId, enabled) => {
    const { machines, events } = get();
    const updatedMachines = machines.map(m => {
      if (m.id === machineId) {
        const updatedMods = (m.modules || []).map(mod => {
          if (mod.id === moduleId) {
            return {
              ...mod,
              status: enabled ? ('HEALTHY' as const) : ('OFFLINE' as const),
              config: { ...mod.config, enabled }
            };
          }
          return mod;
        });
        const { updatedMachine } = evaluateMachineThresholds({ ...m, modules: updatedMods }, events);
        return updatedMachine;
      }
      return m;
    });

    set({ machines: updatedMachines });
  },

  setModuleDataCollection: (machineId, moduleId, dataCollection) => {
    const { machines } = get();
    const updatedMachines = machines.map(m => {
      if (m.id === machineId) {
        const updatedMods = (m.modules || []).map(mod => {
          if (mod.id === moduleId) {
            return {
              ...mod,
              config: { ...mod.config, dataCollection }
            };
          }
          return mod;
        });
        return { ...m, modules: updatedMods };
      }
      return m;
    });

    set({ machines: updatedMachines });
  },

  injectEvent: (eventData) => {
    const { events, machines } = get();
    const now = new Date();
    const targetMachine = machines.find(m => m.id === eventData.machineId);
    
    const newEvt: MachineEvent = {
      ...eventData,
      id: `evt-inj-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-US', { hour12: false }),
      machineName: targetMachine?.name || eventData.machineId
    };

    set({ events: [newEvt, ...events] });
  },

  appendRealtimeTimeSeriesPoint: (machineId, point) => {
    const { historyMap } = get();
    const machineHist = historyMap[machineId];
    if (!machineHist) return;

    // Keep points bounded to last 720 hours (or max array size)
    const updatedPoints = [...machineHist.hourlyPoints, point];
    if (updatedPoints.length > 1000) {
      updatedPoints.shift();
    }

    set({
      historyMap: {
        ...historyMap,
        [machineId]: {
          ...machineHist,
          hourlyPoints: updatedPoints
        }
      }
    });
  },

  reseedHistory: () => {
    const { machines } = get();
    const newHistory = generate30DayHistory(machines);
    set({ historyMap: newHistory });
  },

  resetAll: () => {
    const newHistory = generate30DayHistory(INITIAL_MACHINES);
    set({
      machines: INITIAL_MACHINES,
      historyMap: newHistory,
      events: initialEvents
    });
  },

  selectMachine: (id) => set({ selectedMachineId: id })
}));

