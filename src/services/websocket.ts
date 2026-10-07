import { Machine } from '../types/machine';
import { MachineEvent } from '../types/event';
import { useMachineStore } from '../store/machineStore';
import { useSimulationStore } from '../store/simulationStore';

type TelemetryCallback = (machines: Machine[]) => void;
type EventCallback = (event: MachineEvent) => void;

class MockWebSocketService {
  private telemetrySubscribers: Set<TelemetryCallback> = new Set();
  private eventSubscribers: Set<EventCallback> = new Set();

  public subscribeTelemetry(callback: TelemetryCallback): () => void {
    this.telemetrySubscribers.add(callback);
    return () => this.telemetrySubscribers.delete(callback);
  }

  public subscribeEvents(callback: EventCallback): () => void {
    this.eventSubscribers.add(callback);
    return () => this.eventSubscribers.delete(callback);
  }

  public notifyTelemetry(machines: Machine[]): void {
    const status = useSimulationStore.getState().connectionStatus;
    if (status === 'CONNECTION_LOST' || status === 'OFFLINE') return;
    this.telemetrySubscribers.forEach(cb => cb(machines));
  }

  public notifyEvent(event: MachineEvent): void {
    const status = useSimulationStore.getState().connectionStatus;
    if (status === 'CONNECTION_LOST' || status === 'OFFLINE') return;
    this.eventSubscribers.forEach(cb => cb(event));
  }
}

export const wsService = new MockWebSocketService();
