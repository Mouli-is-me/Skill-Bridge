import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface UIState {
  theme: ThemeMode;
  isSidebarCollapsed: boolean;
  activeEventDrawerId: string | null;
  globalSearch: string;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openEventDrawer: (eventId: string) => void;
  closeEventDrawer: () => void;
  setGlobalSearch: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('skill_bridge_theme') as ThemeMode) || 'light',
  isSidebarCollapsed: false,
  activeEventDrawerId: null,
  globalSearch: '',

  setTheme: (theme) => {
    localStorage.setItem('skill_bridge_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('skill_bridge_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      return { theme: nextTheme };
    });
  },

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  openEventDrawer: (eventId) => set({ activeEventDrawerId: eventId }),
  closeEventDrawer: () => set({ activeEventDrawerId: null }),
  setGlobalSearch: (query) => set({ globalSearch: query })
}));
