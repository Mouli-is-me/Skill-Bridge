import { Machine, MachineMetrics, MachineThresholds } from '../types/machine';
import { MachineModule, ModuleSensor, ModuleStatus } from '../types/module';

/**
 * HARDWARE SENSOR LOCK:
 * Skill Bridge prototype uses strictly these 3 physical sensors:
 * 1. MPU6050: Acceleration (X, Y, Z) and Gyroscope (X, Y, Z)
 * 2. DS18B20: Temperature (°C)
 * 3. LM393: Comparator Pulse/Detection (Detection State, Pulse Rate Hz, Pulse Count)
 */
export function createDefaultModulesForMachine(
  machineId: string,
  machineName: string,
  type: 'Loom' | 'Spinning',
  metrics: MachineMetrics,
  thresholds: MachineThresholds,
  isOnline: boolean = true
): MachineModule[] {
  const cleanId = machineId.replace('-', '');
  const now = new Date().toISOString();

  // 1. MPU6050 — 6-Axis Motion & Acceleration Sensor
  const vibVal = metrics.vibration;
  const isM03 = machineId === 'M-03';
  const mpuStatus: ModuleStatus = !isOnline 
    ? 'OFFLINE' 
    : vibVal >= thresholds.vibCritical 
    ? 'FAULT' 
    : vibVal >= thresholds.vibWarning 
    ? 'WARNING' 
    : 'HEALTHY';

  const accelX = Number((vibVal * 0.42).toFixed(2));
  const accelY = Number((vibVal * 0.31).toFixed(2));
  const accelZ = Number((0.98 + (vibVal * 0.1)).toFixed(2));
  const gyroX = Number((vibVal * 2.4).toFixed(1));
  const gyroY = Number((vibVal * 1.8).toFixed(1));
  const gyroZ = Number((vibVal * 1.2).toFixed(1));

  const mpu6050Module: MachineModule = {
    id: `${cleanId}-MPU6050`,
    machineId,
    machineName,
    name: 'MPU6050',
    sensorModel: 'MPU6050',
    type: 'MPU6050',
    status: mpuStatus,
    lastUpdated: now,
    config: {
      samplingRate: 1,
      enabled: true,
      dataCollection: true,
      warningThreshold: thresholds.vibWarning,
      criticalThreshold: thresholds.vibCritical,
      primarySensorKey: 'accelX'
    },
    sensors: [
      {
        id: `${cleanId}-mpu-accel-x`,
        name: 'Acceleration X',
        key: 'accelX',
        value: accelX,
        unit: 'g',
        warningThreshold: thresholds.vibWarning,
        criticalThreshold: thresholds.vibCritical,
        status: mpuStatus,
        history: [accelX - 0.05, accelX + 0.02, accelX]
      },
      {
        id: `${cleanId}-mpu-accel-y`,
        name: 'Acceleration Y',
        key: 'accelY',
        value: accelY,
        unit: 'g',
        warningThreshold: thresholds.vibWarning,
        criticalThreshold: thresholds.vibCritical,
        status: accelY >= thresholds.vibCritical ? 'FAULT' : accelY >= thresholds.vibWarning ? 'WARNING' : 'HEALTHY',
        history: [accelY - 0.03, accelY + 0.01, accelY]
      },
      {
        id: `${cleanId}-mpu-accel-z`,
        name: 'Acceleration Z',
        key: 'accelZ',
        value: accelZ,
        unit: 'g',
        warningThreshold: thresholds.vibWarning * 1.5,
        criticalThreshold: thresholds.vibCritical * 1.5,
        status: 'HEALTHY',
        history: [accelZ - 0.01, accelZ + 0.01, accelZ]
      },
      {
        id: `${cleanId}-mpu-gyro-x`,
        name: 'Gyroscope X',
        key: 'gyroX',
        value: gyroX,
        unit: '°/s',
        warningThreshold: 25.0,
        criticalThreshold: 40.0,
        status: gyroX >= 40 ? 'FAULT' : gyroX >= 25 ? 'WARNING' : 'HEALTHY',
        history: [gyroX - 0.5, gyroX + 0.2, gyroX]
      },
      {
        id: `${cleanId}-mpu-gyro-y`,
        name: 'Gyroscope Y',
        key: 'gyroY',
        value: gyroY,
        unit: '°/s',
        warningThreshold: 25.0,
        criticalThreshold: 40.0,
        status: 'HEALTHY',
        history: [gyroY - 0.3, gyroY + 0.1, gyroY]
      },
      {
        id: `${cleanId}-mpu-gyro-z`,
        name: 'Gyroscope Z',
        key: 'gyroZ',
        value: gyroZ,
        unit: '°/s',
        warningThreshold: 25.0,
        criticalThreshold: 40.0,
        status: 'HEALTHY',
        history: [gyroZ - 0.2, gyroZ + 0.1, gyroZ]
      }
    ]
  };

  // 2. DS18B20 — Digital Temperature Sensor (ONLY Temperature)
  const tempVal = metrics.temperature;
  const dsStatus: ModuleStatus = !isOnline 
    ? 'OFFLINE' 
    : tempVal >= thresholds.tempCritical 
    ? 'FAULT' 
    : tempVal >= thresholds.tempWarning 
    ? 'WARNING' 
    : 'HEALTHY';

  const ds18b20Module: MachineModule = {
    id: `${cleanId}-DS18B20`,
    machineId,
    machineName,
    name: 'DS18B20',
    sensorModel: 'DS18B20',
    type: 'DS18B20',
    status: dsStatus,
    lastUpdated: now,
    config: {
      samplingRate: 1,
      enabled: true,
      dataCollection: true,
      warningThreshold: thresholds.tempWarning,
      criticalThreshold: thresholds.tempCritical,
      primarySensorKey: 'temperature'
    },
    sensors: [
      {
        id: `${cleanId}-ds18b20-temp`,
        name: 'Temperature',
        key: 'temperature',
        value: Number(tempVal.toFixed(1)),
        unit: '°C',
        warningThreshold: thresholds.tempWarning,
        criticalThreshold: thresholds.tempCritical,
        status: dsStatus,
        history: [tempVal - 0.8, tempVal - 0.3, tempVal]
      }
    ]
  };

  // 3. LM393 — Digital Comparator & Pulse Sensor
  const isRunning = isOnline && metrics.rpm > 50;
  const pulseRateHz = isRunning ? Number((metrics.rpm / 60).toFixed(1)) : 0;
  const initialPulseCount = Math.floor(metrics.rpm * 12.5);

  const lm393Status: ModuleStatus = !isOnline 
    ? 'OFFLINE' 
    : !isRunning 
    ? 'HEALTHY' 
    : pulseRateHz < 2.0 
    ? 'WARNING' 
    : 'HEALTHY';

  const lm393Module: MachineModule = {
    id: `${cleanId}-LM393`,
    machineId,
    machineName,
    name: 'LM393',
    sensorModel: 'LM393',
    type: 'LM393',
    status: lm393Status,
    lastUpdated: now,
    config: {
      samplingRate: 1,
      enabled: true,
      dataCollection: true,
      warningThreshold: 2.0,
      criticalThreshold: 0.5,
      primarySensorKey: 'pulseFrequency'
    },
    sensors: [
      {
        id: `${cleanId}-lm393-state`,
        name: 'Detection',
        key: 'detectionState',
        value: isRunning ? 1 : 0,
        unit: '',
        displayState: isRunning ? 'Detected' : 'Clear',
        warningThreshold: 0,
        criticalThreshold: 0,
        status: 'HEALTHY',
        history: [1, 1, isRunning ? 1 : 0]
      },
      {
        id: `${cleanId}-lm393-freq`,
        name: 'Pulse Rate',
        key: 'pulseFrequency',
        value: pulseRateHz,
        unit: 'Hz',
        warningThreshold: 2.0,
        criticalThreshold: 0.5,
        status: lm393Status,
        history: [pulseRateHz - 0.2, pulseRateHz + 0.1, pulseRateHz]
      },
      {
        id: `${cleanId}-lm393-count`,
        name: 'Pulse Count',
        key: 'pulseCount',
        value: initialPulseCount,
        unit: 'pulses',
        warningThreshold: 0,
        criticalThreshold: 0,
        status: 'HEALTHY',
        history: [initialPulseCount - 20, initialPulseCount - 10, initialPulseCount]
      }
    ]
  };

  // Return ONLY the 3 physical hardware sensors
  return [mpu6050Module, ds18b20Module, lm393Module];
}

export function getMachineModuleStats(modules: MachineModule[] = []) {
  const total = modules.length;
  let healthy = 0;
  let warnings = 0;
  let faults = 0;
  let offline = 0;

  modules.forEach((mod) => {
    if (mod.status === 'FAULT') faults++;
    else if (mod.status === 'WARNING') warnings++;
    else if (mod.status === 'OFFLINE') offline++;
    else healthy++;
  });

  return { total, healthy, warnings, faults, offline };
}

export function evaluateModuleStatus(module: MachineModule): ModuleStatus {
  if (!module.config.enabled) return 'OFFLINE';

  let hasFault = false;
  let hasWarning = false;

  module.sensors.forEach((s) => {
    // For MPU6050 and DS18B20: high values cross thresholds
    if (module.type === 'DS18B20' || module.type === 'MPU6050') {
      if (s.criticalThreshold > 0 && s.value >= s.criticalThreshold) {
        s.status = 'FAULT';
        hasFault = true;
      } else if (s.warningThreshold > 0 && s.value >= s.warningThreshold) {
        s.status = 'WARNING';
        hasWarning = true;
      } else {
        s.status = 'HEALTHY';
      }
    } else if (module.type === 'LM393') {
      // For LM393: pulse rate drops below warning threshold while enabled
      s.status = 'HEALTHY';
    }
  });

  if (hasFault) return 'FAULT';
  if (hasWarning) return 'WARNING';
  return 'HEALTHY';
}
