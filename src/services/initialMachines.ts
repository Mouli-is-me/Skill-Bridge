import { Machine } from '../types/machine';
import { createDefaultModulesForMachine } from '../utils/moduleHelpers';

const RAW_INITIAL_MACHINES: Omit<Machine, 'modules'>[] = [
  {
    id: 'M-01',
    name: 'Air-Jet Loom A1 (Physical Hardware)',
    type: 'Loom',
    location: 'Line A',
    section: 'Weaving Bay 1',
    status: 'OFFLINE',
    isHardware: true,
    hardwareState: {
      espConnected: false,
      backendConnected: false,
      lastSeenSecondsAgo: null
    },
    metrics: {
      rpm: 0,
      temperature: 0,
      vibration: 0,
      current: 0,
      utilization: 0,
      production: 0,
      oee: 0,
      rmsVibration: 0,
      peakVibration: 0,
      vibrationEvents: 0,
      digitalVibrationState: 'QUIET',
      machineState: 'OFFLINE',
      score: 0
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: false,
    model: 'ESP32 Real Hardware Unit',
    installedDate: '2026-10-07'
  },
  {
    id: 'M-02',
    name: 'Air-Jet Loom A2',
    type: 'Loom',
    location: 'Line A',
    section: 'Weaving Bay 1',
    status: 'RUNNING',
    metrics: {
      rpm: 915,
      temperature: 70.1,
      vibration: 2.4,
      current: 18.6,
      utilization: 92.1,
      production: 89,
      oee: 87.5
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Tsudakoma ZAX9200',
    installedDate: '2022-03-15'
  },
  {
    id: 'M-03',
    name: 'Rapier Loom B1',
    type: 'Loom',
    location: 'Line B',
    section: 'Weaving Bay 2',
    status: 'WARNING',
    metrics: {
      rpm: 780,
      temperature: 78.6, // Warning state initially!
      vibration: 4.9,  // Elevated vibration!
      current: 22.4,
      utilization: 74.2,
      production: 65,
      oee: 70.1
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Picanol OptiMax-i',
    installedDate: '2021-08-20'
  },
  {
    id: 'M-04',
    name: 'Rapier Loom B2',
    type: 'Loom',
    location: 'Line B',
    section: 'Weaving Bay 2',
    status: 'RUNNING',
    metrics: {
      rpm: 840,
      temperature: 71.8,
      vibration: 2.8,
      current: 19.5,
      utilization: 88.4,
      production: 82,
      oee: 84.1
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Picanol OptiMax-i',
    installedDate: '2021-08-20'
  },
  {
    id: 'M-05',
    name: 'Water-Jet Loom C1',
    type: 'Loom',
    location: 'Line C',
    section: 'Weaving Bay 3',
    status: 'RUNNING',
    metrics: {
      rpm: 1050,
      temperature: 64.2,
      vibration: 1.9,
      current: 16.8,
      utilization: 96.0,
      production: 104,
      oee: 91.8
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Toyota LWT810',
    installedDate: '2023-01-10'
  },
  {
    id: 'M-06',
    name: 'Water-Jet Loom C2',
    type: 'Loom',
    location: 'Line C',
    section: 'Weaving Bay 3',
    status: 'RUNNING',
    metrics: {
      rpm: 1040,
      temperature: 65.0,
      vibration: 2.0,
      current: 17.0,
      utilization: 95.1,
      production: 102,
      oee: 90.5
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 700,
      rpmMax: 1100
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Toyota LWT810',
    installedDate: '2023-01-10'
  },
  {
    id: 'M-07',
    name: 'Ring Frame S1',
    type: 'Spinning',
    location: 'Line D',
    section: 'Spinning Hall 1',
    status: 'RUNNING',
    metrics: {
      rpm: 18500,
      temperature: 62.5,
      vibration: 1.6,
      current: 45.2,
      utilization: 91.0,
      production: 145,
      oee: 86.4
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 12000,
      rpmMax: 22000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Rieter G38',
    installedDate: '2020-11-05'
  },
  {
    id: 'M-08',
    name: 'Ring Frame S2',
    type: 'Spinning',
    location: 'Line D',
    section: 'Spinning Hall 1',
    status: 'RUNNING',
    metrics: {
      rpm: 18200,
      temperature: 63.8,
      vibration: 1.8,
      current: 46.0,
      utilization: 89.5,
      production: 140,
      oee: 85.0
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 12000,
      rpmMax: 22000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Rieter G38',
    installedDate: '2020-11-05'
  },
  {
    id: 'M-09',
    name: 'Compact Spinning S3',
    type: 'Spinning',
    location: 'Line E',
    section: 'Spinning Hall 2',
    status: 'RUNNING',
    metrics: {
      rpm: 19800,
      temperature: 66.1,
      vibration: 1.4,
      current: 48.5,
      utilization: 93.8,
      production: 160,
      oee: 89.0
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 12000,
      rpmMax: 22000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Sauer Zinser 351',
    installedDate: '2022-06-18'
  },
  {
    id: 'M-10',
    name: 'Compact Spinning S4',
    type: 'Spinning',
    location: 'Line E',
    section: 'Spinning Hall 2',
    status: 'IDLE',
    metrics: {
      rpm: 0,
      temperature: 32.0,
      vibration: 0.1,
      current: 1.2,
      utilization: 0,
      production: 0,
      oee: 0
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 12000,
      rpmMax: 22000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Sauer Zinser 351',
    installedDate: '2022-06-18'
  },
  {
    id: 'M-11',
    name: 'Rotor Spinning R1',
    type: 'Spinning',
    location: 'Line F',
    section: 'Spinning Hall 3',
    status: 'RUNNING',
    metrics: {
      rpm: 105000,
      temperature: 59.4,
      vibration: 2.2,
      current: 62.0,
      utilization: 97.2,
      production: 210,
      oee: 93.4
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 60000,
      rpmMax: 120000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Autocoro 10',
    installedDate: '2023-04-12'
  },
  {
    id: 'M-12',
    name: 'Rotor Spinning R2',
    type: 'Spinning',
    location: 'Line F',
    section: 'Spinning Hall 3',
    status: 'RUNNING',
    metrics: {
      rpm: 104500,
      temperature: 60.8,
      vibration: 2.3,
      current: 61.5,
      utilization: 96.8,
      production: 205,
      oee: 92.8
    },
    thresholds: {
      tempWarning: 75,
      tempCritical: 88,
      vibWarning: 4.5,
      vibCritical: 7.0,
      rpmMin: 60000,
      rpmMax: 120000
    },
    lastUpdated: new Date().toISOString(),
    isOnline: true,
    model: 'Autocoro 10',
    installedDate: '2023-04-12'
  }
];

export const INITIAL_MACHINES: Machine[] = RAW_INITIAL_MACHINES.map(m => {
  const modules = createDefaultModulesForMachine(
    m.id,
    m.name,
    m.type,
    m.metrics,
    m.thresholds,
    m.isOnline
  );
  return {
    ...m,
    modules
  };
});

