import { Machine, MachineMetrics, MachineThresholds } from '../types/machine';
import { MachineModule, ModuleSensor, ModuleStatus } from '../types/module';

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

  if (type === 'Loom') {
    // 1. Motor Module
    const motorTemp = metrics.temperature;
    const motorStatus: ModuleStatus = !isOnline 
      ? 'OFFLINE' 
      : motorTemp >= thresholds.tempCritical 
      ? 'FAULT' 
      : motorTemp >= thresholds.tempWarning 
      ? 'WARNING' 
      : 'HEALTHY';

    const motorModule: MachineModule = {
      id: `${cleanId}-MTR`,
      machineId,
      machineName,
      name: 'Main Drive Motor',
      type: 'Motor',
      status: motorStatus,
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
          id: `${cleanId}-mtr-temp`,
          name: 'Motor Temperature',
          key: 'temperature',
          value: Number(motorTemp.toFixed(1)),
          unit: '°C',
          warningThreshold: thresholds.tempWarning,
          criticalThreshold: thresholds.tempCritical,
          status: motorStatus,
          history: [motorTemp - 1.2, motorTemp - 0.8, motorTemp - 0.4, motorTemp]
        },
        {
          id: `${cleanId}-mtr-rpm`,
          name: 'Motor Speed',
          key: 'rpm',
          value: Math.round(metrics.rpm),
          unit: 'RPM',
          warningThreshold: thresholds.rpmMax || 1100,
          criticalThreshold: (thresholds.rpmMax || 1100) * 1.1,
          status: 'HEALTHY',
          history: [metrics.rpm - 5, metrics.rpm + 2, metrics.rpm - 2, metrics.rpm]
        },
        {
          id: `${cleanId}-mtr-cur`,
          name: 'Current Draw',
          key: 'current',
          value: Number(metrics.current.toFixed(1)),
          unit: 'A',
          warningThreshold: 24.0,
          criticalThreshold: 28.0,
          status: metrics.current >= 28 ? 'FAULT' : metrics.current >= 24 ? 'WARNING' : 'HEALTHY',
          history: [metrics.current - 0.3, metrics.current + 0.1, metrics.current]
        },
        {
          id: `${cleanId}-mtr-volt`,
          name: 'Line Voltage',
          key: 'voltage',
          value: 230.2,
          unit: 'V',
          warningThreshold: 245.0,
          criticalThreshold: 255.0,
          status: 'HEALTHY',
          history: [229.8, 230.5, 230.1, 230.2]
        },
        {
          id: `${cleanId}-mtr-pwr`,
          name: 'Active Power',
          key: 'power',
          value: Math.round(metrics.current * 230.2 * 0.92),
          unit: 'W',
          warningThreshold: 5500,
          criticalThreshold: 6500,
          status: 'HEALTHY',
          history: [540, 550, 552]
        }
      ]
    };

    // 2. Vibration Sensor Module
    const vibVal = metrics.vibration;
    const vibStatus: ModuleStatus = !isOnline 
      ? 'OFFLINE' 
      : vibVal >= thresholds.vibCritical 
      ? 'FAULT' 
      : vibVal >= thresholds.vibWarning 
      ? 'WARNING' 
      : 'HEALTHY';

    const vibX = Number((vibVal * 0.92).toFixed(2));
    const vibY = Number((vibVal * 0.78).toFixed(2));
    const vibZ = Number((vibVal * 0.65).toFixed(2));

    const vibModule: MachineModule = {
      id: `${cleanId}-VIB`,
      machineId,
      machineName,
      name: 'Loom Frame Vibration Sensor',
      type: 'Vibration',
      status: vibStatus,
      lastUpdated: now,
      config: {
        samplingRate: 1,
        enabled: true,
        dataCollection: true,
        warningThreshold: thresholds.vibWarning,
        criticalThreshold: thresholds.vibCritical,
        primarySensorKey: 'vibrationX'
      },
      sensors: [
        {
          id: `${cleanId}-vib-x`,
          name: 'X-Axis Vibration',
          key: 'vibrationX',
          value: vibX,
          unit: 'mm/s',
          warningThreshold: thresholds.vibWarning,
          criticalThreshold: thresholds.vibCritical,
          status: vibStatus,
          history: [vibX - 0.1, vibX + 0.05, vibX]
        },
        {
          id: `${cleanId}-vib-y`,
          name: 'Y-Axis Vibration',
          key: 'vibrationY',
          value: vibY,
          unit: 'mm/s',
          warningThreshold: thresholds.vibWarning,
          criticalThreshold: thresholds.vibCritical,
          status: vibY >= thresholds.vibCritical ? 'FAULT' : vibY >= thresholds.vibWarning ? 'WARNING' : 'HEALTHY',
          history: [vibY - 0.05, vibY + 0.02, vibY]
        },
        {
          id: `${cleanId}-vib-z`,
          name: 'Z-Axis Vibration',
          key: 'vibrationZ',
          value: vibZ,
          unit: 'mm/s',
          warningThreshold: thresholds.vibWarning,
          criticalThreshold: thresholds.vibCritical,
          status: vibZ >= thresholds.vibCritical ? 'FAULT' : vibZ >= thresholds.vibWarning ? 'WARNING' : 'HEALTHY',
          history: [vibZ - 0.04, vibZ + 0.01, vibZ]
        }
      ]
    };

    // 3. Bearing Thermal Sensor Module
    const bearingTemp = Number((metrics.temperature * 0.94).toFixed(1));
    const tempStatus: ModuleStatus = !isOnline 
      ? 'OFFLINE' 
      : bearingTemp >= thresholds.tempCritical 
      ? 'FAULT' 
      : bearingTemp >= thresholds.tempWarning 
      ? 'WARNING' 
      : 'HEALTHY';

    const tempModule: MachineModule = {
      id: `${cleanId}-TEMP`,
      machineId,
      machineName,
      name: 'Bearing Thermal Sensor',
      type: 'Temperature',
      status: tempStatus,
      lastUpdated: now,
      config: {
        samplingRate: 2,
        enabled: true,
        dataCollection: true,
        warningThreshold: thresholds.tempWarning,
        criticalThreshold: thresholds.tempCritical,
        primarySensorKey: 'temperature'
      },
      sensors: [
        {
          id: `${cleanId}-temp-bearing`,
          name: 'Bearing Temperature',
          key: 'temperature',
          value: bearingTemp,
          unit: '°C',
          warningThreshold: thresholds.tempWarning,
          criticalThreshold: thresholds.tempCritical,
          status: tempStatus,
          history: [bearingTemp - 0.5, bearingTemp - 0.2, bearingTemp]
        },
        {
          id: `${cleanId}-temp-ambient`,
          name: 'Ambient Cabinet Temp',
          key: 'ambientTemp',
          value: 28.5,
          unit: '°C',
          warningThreshold: 45.0,
          criticalThreshold: 55.0,
          status: 'HEALTHY',
          history: [28.2, 28.4, 28.5]
        }
      ]
    };

    // 4. Weft Insertion Drive Module
    const driveModule: MachineModule = {
      id: `${cleanId}-DRV`,
      machineId,
      machineName,
      name: 'Weft Insertion Drive Unit',
      type: 'Drive',
      status: isOnline ? 'HEALTHY' : 'OFFLINE',
      lastUpdated: now,
      config: {
        samplingRate: 1,
        enabled: true,
        dataCollection: true,
        warningThreshold: 6.5,
        criticalThreshold: 7.5,
        primarySensorKey: 'pressure'
      },
      sensors: [
        {
          id: `${cleanId}-drv-pressure`,
          name: 'Nozzle Air Pressure',
          key: 'pressure',
          value: Number((5.4 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
          unit: 'bar',
          warningThreshold: 6.5,
          criticalThreshold: 7.5,
          status: 'HEALTHY',
          history: [5.3, 5.4, 5.4]
        },
        {
          id: `${cleanId}-drv-cycle`,
          name: 'Cycle Rate',
          key: 'cycleRate',
          value: Math.round(metrics.rpm),
          unit: 'picks/min',
          warningThreshold: 1100,
          criticalThreshold: 1200,
          status: 'HEALTHY',
          history: [metrics.rpm, metrics.rpm]
        }
      ]
    };

    return [motorModule, vibModule, tempModule, driveModule];
  } else {
    // Spinning Machines (M-07 to M-12)
    const spindleTemp = metrics.temperature;
    const spindleStatus: ModuleStatus = !isOnline 
      ? 'OFFLINE' 
      : spindleTemp >= thresholds.tempCritical 
      ? 'FAULT' 
      : spindleTemp >= thresholds.tempWarning 
      ? 'WARNING' 
      : 'HEALTHY';

    // 1. Spindle Module
    const spindleModule: MachineModule = {
      id: `${cleanId}-SPN`,
      machineId,
      machineName,
      name: 'High-Speed Spindle Drive',
      type: 'Spindle',
      status: spindleStatus,
      lastUpdated: now,
      config: {
        samplingRate: 1,
        enabled: true,
        dataCollection: true,
        warningThreshold: thresholds.tempWarning,
        criticalThreshold: thresholds.tempCritical,
        primarySensorKey: 'rpm'
      },
      sensors: [
        {
          id: `${cleanId}-spn-rpm`,
          name: 'Spindle Speed',
          key: 'rpm',
          value: Math.round(metrics.rpm),
          unit: 'RPM',
          warningThreshold: thresholds.rpmMax || 22000,
          criticalThreshold: (thresholds.rpmMax || 22000) * 1.1,
          status: 'HEALTHY',
          history: [metrics.rpm - 50, metrics.rpm + 20, metrics.rpm]
        },
        {
          id: `${cleanId}-spn-temp`,
          name: 'Spindle Box Temp',
          key: 'temperature',
          value: Number(spindleTemp.toFixed(1)),
          unit: '°C',
          warningThreshold: thresholds.tempWarning,
          criticalThreshold: thresholds.tempCritical,
          status: spindleStatus,
          history: [spindleTemp - 0.8, spindleTemp - 0.3, spindleTemp]
        },
        {
          id: `${cleanId}-spn-cur`,
          name: 'Drive Current',
          key: 'current',
          value: Number(metrics.current.toFixed(1)),
          unit: 'A',
          warningThreshold: 55.0,
          criticalThreshold: 65.0,
          status: 'HEALTHY',
          history: [metrics.current - 0.5, metrics.current]
        }
      ]
    };

    // 2. Vibration Sensor
    const vibVal = metrics.vibration;
    const vibStatus: ModuleStatus = !isOnline 
      ? 'OFFLINE' 
      : vibVal >= thresholds.vibCritical 
      ? 'FAULT' 
      : vibVal >= thresholds.vibWarning 
      ? 'WARNING' 
      : 'HEALTHY';

    const vibModule: MachineModule = {
      id: `${cleanId}-VIB`,
      machineId,
      machineName,
      name: 'Frame Vibration Monitor',
      type: 'Vibration',
      status: vibStatus,
      lastUpdated: now,
      config: {
        samplingRate: 1,
        enabled: true,
        dataCollection: true,
        warningThreshold: thresholds.vibWarning,
        criticalThreshold: thresholds.vibCritical,
        primarySensorKey: 'vibration'
      },
      sensors: [
        {
          id: `${cleanId}-spn-vib`,
          name: 'Frame Vibration',
          key: 'vibration',
          value: Number(vibVal.toFixed(2)),
          unit: 'mm/s',
          warningThreshold: thresholds.vibWarning,
          criticalThreshold: thresholds.vibCritical,
          status: vibStatus,
          history: [vibVal - 0.05, vibVal + 0.02, vibVal]
        },
        {
          id: `${cleanId}-spn-acc`,
          name: 'Peak Acceleration',
          key: 'acceleration',
          value: Number((vibVal * 0.32).toFixed(2)),
          unit: 'g',
          warningThreshold: 1.8,
          criticalThreshold: 2.5,
          status: 'HEALTHY',
          history: [0.38, 0.41, 0.42]
        }
      ]
    };

    // 3. Drafting System Module
    const draftingModule: MachineModule = {
      id: `${cleanId}-DRF`,
      machineId,
      machineName,
      name: 'Drafting System Monitor',
      type: 'Drafting',
      status: isOnline ? 'HEALTHY' : 'OFFLINE',
      lastUpdated: now,
      config: {
        samplingRate: 1,
        enabled: true,
        dataCollection: true,
        warningThreshold: 180,
        criticalThreshold: 220,
        primarySensorKey: 'draftSpeed'
      },
      sensors: [
        {
          id: `${cleanId}-drf-spd`,
          name: 'Drafting Speed',
          key: 'draftSpeed',
          value: Number((metrics.rpm > 0 ? (metrics.production * 1.2) : 0).toFixed(1)),
          unit: 'm/min',
          warningThreshold: 180,
          criticalThreshold: 220,
          status: 'HEALTHY',
          history: [150, 155, 158]
        },
        {
          id: `${cleanId}-drf-nip`,
          name: 'Nip Line Pressure',
          key: 'nipPressure',
          value: metrics.rpm > 0 ? 120 : 0,
          unit: 'N',
          warningThreshold: 140,
          criticalThreshold: 160,
          status: 'HEALTHY',
          history: [120, 120, 120]
        }
      ]
    };

    // 4. Power Management Unit
    const powerModule: MachineModule = {
      id: `${cleanId}-PWR`,
      machineId,
      machineName,
      name: 'Power Management Unit',
      type: 'Power',
      status: isOnline ? 'HEALTHY' : 'OFFLINE',
      lastUpdated: now,
      config: {
        samplingRate: 2,
        enabled: true,
        dataCollection: true,
        warningThreshold: 75,
        criticalThreshold: 90,
        primarySensorKey: 'power'
      },
      sensors: [
        {
          id: `${cleanId}-pwr-volt`,
          name: 'Line Voltage',
          key: 'voltage',
          value: 400.4,
          unit: 'V',
          warningThreshold: 430,
          criticalThreshold: 450,
          status: 'HEALTHY',
          history: [400.1, 400.6, 400.4]
        },
        {
          id: `${cleanId}-pwr-kw`,
          name: 'Total Power',
          key: 'power',
          value: Number(((metrics.current * 400 * 1.732 * 0.88) / 1000).toFixed(1)),
          unit: 'kW',
          warningThreshold: 75,
          criticalThreshold: 90,
          status: 'HEALTHY',
          history: [28.4, 29.1, 29.5]
        }
      ]
    };

    return [spindleModule, vibModule, draftingModule, powerModule];
  }
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
    if (s.value >= s.criticalThreshold) {
      s.status = 'FAULT';
      hasFault = true;
    } else if (s.value >= s.warningThreshold) {
      s.status = 'WARNING';
      hasWarning = true;
    } else {
      s.status = 'HEALTHY';
    }
  });

  if (hasFault) return 'FAULT';
  if (hasWarning) return 'WARNING';
  return 'HEALTHY';
}
