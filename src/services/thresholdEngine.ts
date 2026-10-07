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
      // Sync sensor value if key matches
      if (sensor.key === 'temperature') val = metrics.temperature;
      else if (sensor.key === 'rpm' || sensor.key === 'cycleRate') val = metrics.rpm;
      else if (sensor.key === 'vibration' || sensor.key === 'vibrationX') val = metrics.vibration;
      else if (sensor.key === 'current') val = metrics.current;

      const wThresh = sensor.warningThreshold;
      const cThresh = sensor.criticalThreshold;

      let sStatus: 'HEALTHY' | 'WARNING' | 'FAULT' = 'HEALTHY';
      if (val >= cThresh) sStatus = 'FAULT';
      else if (val >= wThresh) sStatus = 'WARNING';

      const history = sensor.history ? [...sensor.history.slice(-20), val] : [val];

      return {
        ...sensor,
        value: val,
        status: sStatus,
        history
      };
    });

    const evaluatedMod = {
      ...mod,
      sensors: updatedSensors,
      lastUpdated: isoTime
    };

    evaluatedMod.status = evaluateModuleStatus(evaluatedMod);
    return evaluatedMod;
  });

  // 1. Check Temperature
  const motorMod = updatedModules.find(m => m.type === 'Motor' || m.type === 'Spindle');
  if (metrics.temperature >= thresholds.tempCritical) {
    calculatedStatus = 'ERROR';
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'TEMP_EXCEEDED' && e.severity === 'ERROR');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-temp-crit`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: motorMod?.id || `${machine.id.replace('-', '')}-MTR`,
        moduleName: motorMod?.name || 'Motor Drive',
        timestamp: isoTime,
        formattedTime,
        severity: 'ERROR',
        type: 'TEMP_EXCEEDED',
        message: `Critical temperature threshold reached: ${metrics.temperature.toFixed(1)}°C (Limit: ${thresholds.tempCritical}°C)`,
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
        moduleId: motorMod?.id || `${machine.id.replace('-', '')}-MTR`,
        moduleName: motorMod?.name || 'Motor Drive',
        timestamp: isoTime,
        formattedTime,
        severity: 'WARNING',
        type: 'TEMP_EXCEEDED',
        message: `High temperature warning: ${metrics.temperature.toFixed(1)}°C (Limit: ${thresholds.tempWarning}°C)`,
        metricName: 'temperature',
        value: metrics.temperature,
        threshold: thresholds.tempWarning,
        unit: '°C'
      });
    }
  }

  // 2. Check Vibration
  const vibMod = updatedModules.find(m => m.type === 'Vibration');
  if (metrics.vibration >= thresholds.vibCritical) {
    calculatedStatus = 'ERROR';
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'VIB_HIGH' && e.severity === 'ERROR');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-vib-crit`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: vibMod?.id || `${machine.id.replace('-', '')}-VIB`,
        moduleName: vibMod?.name || 'Vibration Sensor',
        timestamp: isoTime,
        formattedTime,
        severity: 'ERROR',
        type: 'VIB_HIGH',
        message: `Critical vibration detected: ${metrics.vibration.toFixed(2)} mm/s (Limit: ${thresholds.vibCritical} mm/s)`,
        metricName: 'vibration',
        value: metrics.vibration,
        threshold: thresholds.vibCritical,
        unit: 'mm/s'
      });
    }
  } else if (metrics.vibration >= thresholds.vibWarning) {
    if ((calculatedStatus as string) !== 'ERROR') {
      calculatedStatus = 'WARNING';
    }
    const recent = prevEvents.find(e => e.machineId === machine.id && e.type === 'VIB_HIGH' && e.severity === 'WARNING');
    if (!recent || (now.getTime() - new Date(recent.timestamp).getTime()) > 30000) {
      newEvents.push({
        id: `evt-${machine.id}-${Date.now()}-vib-warn`,
        machineId: machine.id,
        machineName: machine.name,
        moduleId: vibMod?.id || `${machine.id.replace('-', '')}-VIB`,
        moduleName: vibMod?.name || 'Vibration Sensor',
        timestamp: isoTime,
        formattedTime,
        severity: 'WARNING',
        type: 'VIB_HIGH',
        message: `Elevated vibration level: ${metrics.vibration.toFixed(2)} mm/s (Limit: ${thresholds.vibWarning} mm/s)`,
        metricName: 'vibration',
        value: metrics.vibration,
        threshold: thresholds.vibWarning,
        unit: 'mm/s'
      });
    }
  }

  // 3. Check Machine Stopped / Idle
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
