export type ModuleType = 
  | 'Motor' 
  | 'Vibration' 
  | 'Temperature' 
  | 'Drive' 
  | 'Power' 
  | 'Pneumatics' 
  | 'Spindle'
  | 'Drafting';

export type ModuleStatus = 'HEALTHY' | 'WARNING' | 'FAULT' | 'OFFLINE';

export interface ModuleSensor {
  id: string;
  name: string;
  key: string;              // e.g. 'temperature', 'rpm', 'current', 'vibrationX', 'vibrationY', 'vibrationZ', 'voltage', 'power', 'pressure'
  value: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  status: ModuleStatus;
  history?: number[];       // Recent trailing buffer for sparkline/realtime chart
}

export interface ModuleConfig {
  samplingRate: number;     // in seconds: 0.5, 1, 2, 5
  enabled: boolean;
  dataCollection: boolean;
  warningThreshold: number;
  criticalThreshold: number;
  primarySensorKey: string;
}

export interface MachineModule {
  id: string;               // e.g. 'M01-MTR'
  machineId: string;        // e.g. 'M-01'
  machineName?: string;
  name: string;             // e.g. 'Main Drive Motor'
  type: ModuleType;
  status: ModuleStatus;
  sensors: ModuleSensor[];
  lastUpdated: string;      // ISO string
  config: ModuleConfig;
  statusMessage?: string;
}
