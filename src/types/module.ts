// HARDWARE SENSOR LOCK: The prototype uses ONLY these three physical sensors:
// 1. MPU6050 (Motion / Acceleration / Gyroscope)
// 2. DS18B20 (Temperature)
// 3. LM393 (Pulse / Detection Comparator)

export type ModuleType = 'MPU6050' | 'DS18B20' | 'LM393';

export type ModuleStatus = 'HEALTHY' | 'WARNING' | 'FAULT' | 'OFFLINE';

export interface ModuleSensor {
  id: string;
  name: string;
  key: string;              // e.g. 'accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ', 'temperature', 'pulseFrequency', 'detectionState', 'pulseCount'
  value: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  status: ModuleStatus;
  history?: number[];       // Recent trailing buffer for sparkline/realtime chart
  displayState?: string;    // Optional formatted state (e.g. 'Detected', 'Clear', 'Active')
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
  id: string;               // e.g. 'M01-MPU6050', 'M01-DS18B20', 'M01-LM393'
  machineId: string;        // e.g. 'M-01'
  machineName?: string;
  name: string;             // Hardware sensor designation: 'MPU6050', 'DS18B20', 'LM393'
  sensorModel: 'MPU6050' | 'DS18B20' | 'LM393';
  type: ModuleType;
  status: ModuleStatus;
  sensors: ModuleSensor[];
  lastUpdated: string;      // ISO string
  config: ModuleConfig;
  statusMessage?: string;
}
