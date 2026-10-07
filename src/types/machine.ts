import { MachineModule } from './module';

export type MachineType = 'Loom' | 'Spinning';

export type MachineStatus = 'RUNNING' | 'WARNING' | 'ERROR' | 'IDLE';

export interface MachineThresholds {
  tempWarning: number;   // °C (default ~75)
  tempCritical: number;  // °C (default ~88)
  vibWarning: number;    // mm/s (default ~4.5)
  vibCritical: number;   // mm/s (default ~7.0)
  rpmMin: number;        // RPM floor
  rpmMax: number;        // RPM target max
}

export interface MachineMetrics {
  rpm: number;
  temperature: number; // °C
  vibration: number;   // mm/s
  current: number;     // Amps
  utilization: number; // % (0 - 100)
  production: number;  // units/hr
  oee: number;         // % (0 - 100)
}

export interface Machine {
  id: string;            // e.g. "M-01"
  name: string;          // e.g. "Air-Jet Loom A1"
  type: MachineType;
  location: string;      // e.g. "Production Line 1"
  section: string;       // e.g. "Weaving Bay 1"
  status: MachineStatus;
  metrics: MachineMetrics;
  thresholds: MachineThresholds;
  modules: MachineModule[];
  lastUpdated: string;   // ISO string
  isOnline: boolean;
  model: string;         // e.g. "Tsudakoma ZAX9200" / "Rieter G38"
  installedDate: string;
}

export interface MetricTimeSeriesPoint {
  timestamp: string;      // ISO or formatted time
  timestampRaw: number;   // Epoch ms
  temperature: number;
  vibration: number;
  rpm: number;
  current: number;
  production: number;
  utilization: number;
}

export interface HistoricalMachineData {
  machineId: string;
  hourlyPoints: MetricTimeSeriesPoint[];
  dailySummary: {
    date: string;
    totalProduction: number;
    avgUtilization: number;
    totalDowntimeMinutes: number;
    avgOee: number;
  }[];
}
