import { create } from 'zustand';

export type ConnectionStatus = 'LIVE' | 'DEGRADED' | 'CONNECTION_LOST' | 'OFFLINE';

interface SimulationState {
  connectionStatus: ConnectionStatus;
  lastSyncTime: string;
  isSimulating: boolean;
  m03ScenarioStage: 'NORMAL' | 'OVERHEATING' | 'CRITICAL_VIB' | 'STOPPED';
  
  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateSyncTime: () => void;
  toggleSimulation: () => void;
  retryConnection: () => void;
  setM03ScenarioStage: (stage: 'NORMAL' | 'OVERHEATING' | 'CRITICAL_VIB' | 'STOPPED') => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  connectionStatus: 'LIVE',
  lastSyncTime: new Date().toISOString(),
  isSimulating: true,
  m03ScenarioStage: 'OVERHEATING',

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  updateSyncTime: () => set({ lastSyncTime: new Date().toISOString() }),
  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),
  retryConnection: () => set({
    connectionStatus: 'LIVE',
    lastSyncTime: new Date().toISOString()
  }),
  setM03ScenarioStage: (stage) => set({ m03ScenarioStage: stage })
}));
