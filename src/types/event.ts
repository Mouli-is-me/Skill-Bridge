export type EventSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type EventType = 
  | 'TEMP_EXCEEDED' 
  | 'VIB_HIGH' 
  | 'MACHINE_STOPPED' 
  | 'RESTARTED' 
  | 'MAINTENANCE' 
  | 'THRESHOLD_UPDATED'
  | 'MANUAL_INJECTION'
  | 'SYSTEM';

export interface MachineEvent {
  id: string;
  machineId: string;
  machineName: string;
  moduleId?: string;
  moduleName?: string;
  timestamp: string;      // ISO string
  formattedTime: string;  // HH:mm:ss format
  severity: EventSeverity;
  type: EventType;
  message: string;
  metricName?: string;
  value?: number;
  threshold?: number;
  unit?: string;
  acknowledged?: boolean;
}
