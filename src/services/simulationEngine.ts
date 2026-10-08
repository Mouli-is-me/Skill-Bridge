import { useMachineStore } from '../store/machineStore';
import { useSimulationStore } from '../store/simulationStore';

let simulationIntervalId: number | null = null;

export function startSimulationEngine(intervalMs: number = 1500) {
  if (simulationIntervalId !== null) return;

  simulationIntervalId = window.setInterval(() => {
    const { isSimulating, connectionStatus, m03ScenarioStage, updateSyncTime } = useSimulationStore.getState();

    // If simulation paused or connection lost/offline, do not tick
    if (!isSimulating || connectionStatus === 'CONNECTION_LOST' || connectionStatus === 'OFFLINE') {
      return;
    }

    updateSyncTime();
    const { machines, updateMachineMetrics, appendRealtimeTimeSeriesPoint } = useMachineStore.getState();

    const now = new Date();
    const isoTime = now.toISOString();

    machines.forEach((machine) => {
      if (machine.id === 'M-01' || machine.id === 'M01' || machine.isHardware) return;
      if (!machine.isOnline) return;

      const m = machine.metrics;
      let newTemp = m.temperature;
      let newVib = m.vibration;
      let newRpm = m.rpm;
      let newCurrent = m.current;
      let newUtil = m.utilization;
      let newProd = m.production;

      // Special M-03 Scenario Logic
      if (machine.id === 'M-03') {
        if (m03ScenarioStage === 'OVERHEATING') {
          newTemp = Math.min(86, newTemp + (Math.random() * 0.4 + 0.1));
          newVib = Math.min(6.5, newVib + (Math.random() * 0.15 + 0.05));
          newRpm = Math.max(700, newRpm - Math.floor(Math.random() * 5));
          newUtil = Math.max(65, newUtil - 0.2);
        } else if (m03ScenarioStage === 'CRITICAL_VIB') {
          newTemp = Math.min(92, newTemp + 0.5);
          newVib = Math.min(8.5, newVib + 0.3);
          newRpm = Math.max(400, newRpm - 20);
        } else if (m03ScenarioStage === 'STOPPED') {
          newRpm = 0;
          newUtil = 0;
          newProd = 0;
          newCurrent = 0.5;
          newTemp = Math.max(30, newTemp - 0.5);
          newVib = 0.1;
        } else {
          // NORMAL
          newTemp = 70.0 + (Math.random() - 0.5) * 1.0;
          newVib = 2.2 + (Math.random() - 0.5) * 0.4;
          newRpm = 840 + Math.floor((Math.random() - 0.5) * 10);
        }
      } else if (machine.status === 'IDLE') {
        // Idle machines stay near zero
        newRpm = 0;
        newUtil = 0;
        newProd = 0;
        newVib = Number((0.05 + Math.random() * 0.05).toFixed(2));
        newTemp = Math.max(25, newTemp - 0.1);
      } else {
        // Normal random jitter
        const tempDelta = (Math.random() - 0.49) * 0.3;
        newTemp = Math.max(40, Math.min(84, newTemp + tempDelta));

        const vibDelta = (Math.random() - 0.49) * 0.08;
        newVib = Math.max(0.8, Math.min(6.8, newVib + vibDelta));

        const rpmJitter = Math.floor((Math.random() - 0.5) * 6);
        newRpm = Math.max(500, newRpm + rpmJitter);

        const utilJitter = (Math.random() - 0.49) * 0.2;
        newUtil = Math.max(70, Math.min(99.5, newUtil + utilJitter));

        newProd = Math.round((newRpm / 10) * (newUtil / 100));
        newCurrent = Number(((newRpm / 200) + (newVib * 0.3) + (Math.random() * 0.2)).toFixed(1));
      }

      updateMachineMetrics(machine.id, {
        temperature: Number(newTemp.toFixed(1)),
        vibration: Number(newVib.toFixed(2)),
        rpm: Math.round(newRpm),
        current: Number(newCurrent.toFixed(1)),
        utilization: Number(newUtil.toFixed(1)),
        production: Math.round(newProd)
      });

      appendRealtimeTimeSeriesPoint(machine.id, {
        timestamp: isoTime,
        timestampRaw: now.getTime(),
        temperature: Number(newTemp.toFixed(1)),
        vibration: Number(newVib.toFixed(2)),
        rpm: Math.round(newRpm),
        current: Number(newCurrent.toFixed(1)),
        production: Math.round(newProd),
        utilization: Number(newUtil.toFixed(1))
      });
    });
  }, intervalMs);
}

export function stopSimulationEngine() {
  if (simulationIntervalId !== null) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
  }
}
