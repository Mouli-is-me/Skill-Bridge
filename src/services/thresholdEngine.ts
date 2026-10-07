import { Machine, MachineStatus } from '../types/machine';
import { MachineModule, ModuleStatus } from '../types/module';
import { MachineEvent } from '../types/event';
import { evaluateModuleStatus } from '../utils/moduleHelpers';

export function evaluateMachineThresholds(
  machine: Machine,
  prevEvents: MachineEvent[]
): { updatedMachine: Machine; newEvents: MachineEvent[] } {
  const { metrics, thresholds, modules = [] } = machine;
  const newEvents: MachineEvent[] = [];
  let calculatedStatus: MachineStatus = 'RUNNING';

  const now = new Date();
  const isoTime = now.toISOString();
  const formattedTime = now.toLocaleTimeString('en-US', { hour12: false });
  const cleanId = machine.id.replace('-', '');

  // Update modules based on current metrics
  const updatedModules: MachineModule[] = modules.map(mod => {
    const isEnabled = mod.config.enabled;
    if (!isEnabled || !machine.isOnline) {
      return {
        ...mod,
        status: 'OFFLINE' as ModuleStatus,
        lastUpdated: isoTime
      };
    }

    const updatedSensors = mod.sensors.map(sensor => {
      let val = sensor.value;
      let displayState = sensor.displayState;

      // 1. DS18B20 temperature
      if (mod.type === 'DS18B20' && sensor.key === 'temperature') {
        val = metrics.temperature;
      }
      // 2. MPU6050 motion readings
      else if (mod.type === 'MPU6050') {
        if (sensor.key === 'accelX') val = Number((metrics.vibration * 0.42).toFixed(2));
        else if (sensor.key === 'accelY') val = Number((metrics.vibration * 0.31).toFixed(2));
        else if (sensor.key === 'accelZ') val = Number((0.98 + (metrics.vibration * 0.1)).toFixed(2));
        else if (sensor.key === 'gyroX') val = Number((metrics.vibration * 2.4).toFixed(1));
        else if (sensor.key === 'gyroY') val = Number((metrics.vibration * 1.8).toFixed(1));
        else if (sensor.key === 'gyroZ') val = Number((metrics.vibration * 1.2).toFixed(1));
      }
      // 3. LM393 pulse & detection comparator
      else if (mod.type === 'LM393') {
        const isRunning = metrics.rpm > 50;
        if (sensor.key === 'detectionState') {
          val = isRunning ? 1 : 0;
          displayState = isRunning ? 'Detected' : 'Clear';
        } else if (sensor.key === 'pulseFrequency') {
          val = isRunning ? Number((metrics.rpm / 60).toFixed(1)) : 0;
        } else if (sensor.key === 'pulseCount') {
          val = sensor.value + (isRunning ? Math.round(metrics.rpm / 60) : 0);
        }
      }

      const wThresh = sensor.warningThreshold;
      const cThresh = sensor.criticalThreshold;

      let sStatus: 'HEALTHY' | 'WARNING' | 'FAULT' = 'HEALTHY';
      if (cThresh > 0 && val >= cThresh) sStatus = 'FAULT';
      else if (wThresh > 0 && val >= wThresh) sStatus = 'WARNING';

      const history = sensor.history ? [...sensor.history.slice(-20), val] : [val];

      return {
        ...sensor,
        value: val,
        displayState,
        status: sStatus,
        history
      };
    });

    const evaluatedMod: MachineModule = {
      ...mod,
      sensors: updatedSensors,
      lastUpdated: isoTime
    };

    evaluatedMod.status = evaluateModuleStatus(evaluatedMod);
    return evaluatedMod;
  });

  // 1. Evaluate DS18B20 Temperature
  const ds18b20Mod = updatedModules.find(m => m.type === 'DS18B20');
  if (metrics.temperature >= thresholds.tempCritical) {
    calculatedStatus = 'ERROR';
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'TEMP_EXCEEDED' && e.severity === 'ERROR');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-temp-crit`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: ds18b20Mod?.id || `${cleanId}-DS18B20`,
        moduleName: 'DS18B20',
        timestamp: isoTime,
        formattedTime,
        severity: 'ERROR',
        type: 'TEMP_EXCEEDED',
        message: `DS18B20 critical temperature limit exceeded: ${metrics.temperature.toFixed(1)}°C (Limit: ${thresholds.tempCritical}°C)`,
        metricName: 'temperature',
        value: metrics.temperature,
        threshold: thresholds.tempCritical,
        unit: '°C'
      });
    }
  } else if (metrics.temperature >= thresholds.tempWarning) {
    calculatedStatus = 'WARNING';
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'TEMP_EXCEEDED' && e.severity === 'WARNING');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-temp-warn`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: ds18b20Mod?.id || `${cleanId}-DS18B20`,
        moduleName: 'DS18B20',
        timestamp: isoTime,
        formattedTime,
        severity: 'WARNING',
        type: 'TEMP_EXCEEDED',
        message: `DS18B20 high temperature warning: ${metrics.temperature.toFixed(1)}°C (Limit: ${thresholds.tempWarning}°C)`,
        metricName: 'temperature',
        value: metrics.temperature,
        threshold: thresholds.tempWarning,
        unit: '°C'
      });
    }
  }

  // 2. Evaluate MPU6050 Acceleration / Motion
  const mpuMod = updatedModules.find(m => m.type === 'MPU6050');
  if (metrics.vibration >= thresholds.vibCritical) {
    calculatedStatus = 'ERROR';
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'VIB_HIGH' && e.severity === 'ERROR');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-mpu-crit`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: mpuMod?.id || `${cleanId}-MPU6050`,
        moduleName: 'MPU6050',
        timestamp: isoTime,
        formattedTime,
        severity: 'ERROR',
        type: 'VIB_HIGH',
        message: `MPU6050 critical acceleration / motion detected: ${(metrics.vibration * 0.42).toFixed(2)} g`,
        metricName: 'vibration',
        value: Number((metrics.vibration * 0.42).toFixed(2)),
        threshold: thresholds.vibCritical,
        unit: 'g'
      });
    }
  } else if (metrics.vibration >= thresholds.vibWarning) {
    if ((calculatedStatus as string) !== 'ERROR') {
      calculatedStatus = 'WARNING';
    }
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'VIB_HIGH' && e.severity === 'WARNING');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-mpu-warn`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: mpuMod?.id || `${cleanId}-MPU6050`,
        moduleName: 'MPU6050',
        timestamp: isoTime,
        formattedTime,
        severity: 'WARNING',
        type: 'VIB_HIGH',
        message: `MPU6050 elevated acceleration / motion: ${(metrics.vibration * 0.42).toFixed(2)} g`,
        metricName: 'vibration',
        value: Number((metrics.vibration * 0.42).toFixed(2)),
        threshold: thresholds.vibWarning,
        unit: 'g'
      });
    }
  }

  // 3. Machine Stopped Check
  if (metrics.rpm < 50) {
    calculatedStatus = 'IDLE';
  }

  return {
    updatedMachine: {
      ...machine,
      status: calculatedStatus,
      modules: updatedModules,
      lastUpdated: isoTime
    },
    newEvents
  };
}
