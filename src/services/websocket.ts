import { Machine } from '../types/machine';
import { MachineModule, ModuleStatus } from '../types/module';
import { MachineEvent } from '../types/event';
import { useMachineStore } from '../store/machineStore';
import { useSimulationStore } from '../store/simulationStore';

type TelemetryCallback = (machines: Machine[]) => void;
type EventCallback = (event: MachineEvent) => void;

export interface ESP32TelemetryPayload {
  machine_id: string;
  device_id: string;
  timestamp: number;
  machine: {
    state: string;  // IDLE, STARTING, RUNNING, STOPPING, ABNORMAL, OFFLINE
    score: number;  // 0 - 100
    status: string; // NORMAL, DEVIATE, ALERT, OFFLINE
  };
  mpu6050: {
    rms: number;
    peak: number;
    events: number;
  };
  ds18b20: {
    temperature: number;
  };
  digital_vibration: {
    state: 'QUIET' | 'ACTIVE';
  };
  last_seen_seconds_ago?: number;
  is_online?: boolean;
}

class HardwareWebSocketService {
  private telemetrySubscribers: Set<TelemetryCallback> = new Set();
  private eventSubscribers: Set<EventCallback> = new Set();
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private backendConnected: boolean = false;

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000/ws/machines/M01`;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    const url = this.getWebSocketUrl();
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.backendConnected = true;
        const { machines } = useMachineStore.getState();
        const currentM01 = machines.find((m) => m.id === 'M-01' || m.id === 'M01');
        const currentEspConnected = currentM01?.hardwareState?.espConnected ?? false;
        this.updateHardwareState(currentEspConnected, true, currentM01?.hardwareState?.lastSeenSecondsAgo ?? null);
        useSimulationStore.getState().setConnectionStatus('LIVE');
        useSimulationStore.getState().updateSyncTime();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload: ESP32TelemetryPayload = JSON.parse(event.data);
          this.handleIncomingTelemetry(payload);
        } catch (e) {
          console.error('[WebSocket] Failed to parse telemetry payload:', e);
        }
      };

      this.ws.onclose = () => {
        this.backendConnected = false;
        this.updateHardwareState(false, false, null);
        useSimulationStore.getState().setConnectionStatus('CONNECTION_LOST');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.backendConnected = false;
        this.updateHardwareState(false, false, null);
        this.ws?.close();
      };
    } catch (e) {
      this.backendConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, 3000);
  }

  private updateHardwareState(espConnected: boolean, backendConnected: boolean, lastSeenSecondsAgo: number | null): void {
    const { machines, setMachines } = useMachineStore.getState();
    const updated = machines.map((m) => {
      if (m.id === 'M-01' || m.id === 'M01') {
        return {
          ...m,
          isOnline: espConnected,
          status: (espConnected ? (m.status === 'OFFLINE' ? ('RUNNING' as const) : m.status) : ('OFFLINE' as const)),
          hardwareState: {
            espConnected,
            backendConnected,
            lastSeenSecondsAgo
          }
        };
      }
      return m;
    });
    setMachines(updated);
  }

  public handleIncomingTelemetry(payload: ESP32TelemetryPayload): void {
    const { machines, setMachines } = useMachineStore.getState();
    const nowIso = new Date().toISOString();
    const isOnline = payload.is_online ?? (payload.machine.status !== 'OFFLINE');
    const lastSeen = payload.last_seen_seconds_ago ?? 0;

    // Map ESP status string ("NORMAL", "DEVIATE", "ALERT", "OFFLINE") to frontend status
    let mappedStatus: Machine['status'] = 'RUNNING';
    if (!isOnline || payload.machine.status === 'OFFLINE') {
      mappedStatus = 'OFFLINE';
    } else if (payload.machine.status === 'ALERT') {
      mappedStatus = 'FAULT';
    } else if (payload.machine.status === 'DEVIATE') {
      mappedStatus = 'WARNING';
    } else if (payload.machine.state === 'IDLE') {
      mappedStatus = 'IDLE';
    }

    const updatedMachines = machines.map((m) => {
      if (m.id === 'M-01' || m.id === 'M01') {
        // Update M01 Machine modules
        const updatedModules: MachineModule[] = m.modules.map((mod) => {
          if (mod.name === 'MPU6050' || mod.type === 'MPU6050') {
            const rmsVal = payload.mpu6050.rms;
            const peakVal = payload.mpu6050.peak;
            const eventsVal = payload.mpu6050.events;

            const updatedSensors = mod.sensors.map((s) => {
              if (s.key === 'accelX' || s.name.includes('RMS') || s.name.includes('Acceleration X')) {
                const hist = [...(s.history || []), rmsVal].slice(-15);
                return { ...s, value: rmsVal, history: hist, name: 'RMS Vibration', unit: 'g' };
              }
              if (s.key === 'accelY' || s.name.includes('Peak') || s.name.includes('Acceleration Y')) {
                const hist = [...(s.history || []), peakVal].slice(-15);
                return { ...s, value: peakVal, history: hist, name: 'Peak Vibration', unit: 'g' };
              }
              if (s.key === 'accelZ' || s.name.includes('Event') || s.name.includes('Acceleration Z')) {
                const hist = [...(s.history || []), eventsVal].slice(-15);
                return { ...s, value: eventsVal, history: hist, name: 'Vibration Events', unit: 'count' };
              }
              return s;
            });

            const modStatus: ModuleStatus = isOnline ? (rmsVal > 2.0 ? 'FAULT' : rmsVal > 1.0 ? 'WARNING' : 'HEALTHY') : 'OFFLINE';

            return {
              ...mod,
              lastUpdated: nowIso,
              status: modStatus,
              sensors: updatedSensors
            };
          }

          if (mod.name === 'DS18B20' || mod.type === 'DS18B20') {
            const tempVal = payload.ds18b20.temperature;
            const updatedSensors = mod.sensors.map((s) => {
              if (s.key === 'temperature' || s.name.includes('Temperature')) {
                const hist = [...(s.history || []), tempVal].slice(-15);
                return { ...s, value: tempVal, history: hist };
              }
              return s;
            });

            const modStatus: ModuleStatus = isOnline ? (tempVal > 75 ? 'FAULT' : tempVal > 60 ? 'WARNING' : 'HEALTHY') : 'OFFLINE';

            return {
              ...mod,
              lastUpdated: nowIso,
              status: modStatus,
              sensors: updatedSensors
            };
          }

          if (mod.name === 'LM393' || mod.type === 'LM393' || mod.name.includes('Vibration Sensor')) {
            const stateVal = payload.digital_vibration.state;
            const updatedSensors = mod.sensors.map((s) => {
              if (s.key === 'detectionState' || s.name.includes('Digital') || s.name.includes('Detection')) {
                return {
                  ...s,
                  name: 'Digital State',
                  displayState: stateVal,
                  value: stateVal === 'ACTIVE' ? 1 : 0,
                  unit: ''
                };
              }
              return s;
            });

            const modStatus: ModuleStatus = isOnline ? (stateVal === 'ACTIVE' ? 'WARNING' : 'HEALTHY') : 'OFFLINE';

            return {
              ...mod,
              name: 'Digital Vibration Sensor',
              lastUpdated: nowIso,
              status: modStatus,
              sensors: updatedSensors
            };
          }

          return mod;
        });

        return {
          ...m,
          status: mappedStatus,
          isOnline,
          lastUpdated: nowIso,
          hardwareState: {
            espConnected: isOnline,
            backendConnected: true,
            lastSeenSecondsAgo: lastSeen
          },
          metrics: {
            ...m.metrics,
            temperature: payload.ds18b20.temperature,
            vibration: payload.mpu6050.rms,
            rmsVibration: payload.mpu6050.rms,
            peakVibration: payload.mpu6050.peak,
            vibrationEvents: payload.mpu6050.events,
            digitalVibrationState: payload.digital_vibration.state,
            machineState: payload.machine.state,
            score: payload.machine.score,
            oee: payload.machine.score
          },
          modules: updatedModules
        };
      }
      return m;
    });

    setMachines(updatedMachines);
    useSimulationStore.getState().updateSyncTime();
    this.notifyTelemetry(updatedMachines);
  }

  public isBackendConnected(): boolean {
    return this.backendConnected;
  }

  public subscribeTelemetry(callback: TelemetryCallback): () => void {
    this.telemetrySubscribers.add(callback);
    return () => this.telemetrySubscribers.delete(callback);
  }

  public subscribeEvents(callback: EventCallback): () => void {
    this.eventSubscribers.add(callback);
    return () => this.eventSubscribers.delete(callback);
  }

  public notifyTelemetry(machines: Machine[]): void {
    this.telemetrySubscribers.forEach((cb) => cb(machines));
  }

  public notifyEvent(event: MachineEvent): void {
    this.eventSubscribers.forEach((cb) => cb(event));
  }
}

export const wsService = new HardwareWebSocketService();
