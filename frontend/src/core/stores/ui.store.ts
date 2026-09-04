import { create } from 'zustand';

/**
 * UI Store — global client-only UI state using Zustand.
 *
 * Architecture rule: This store holds ONLY client-side UI state.
 * Server data (messages, profiles, sessions) belongs in TanStack Query, NOT here.
 *
 * Decision flow:
 *   - Does it come from the server? → TanStack Query
 *   - Is it UI-only and shared across the app? → This store
 *   - Is it static config (auth identity, theme)? → Context
 *
 * Add slices to this store as the application grows:
 *   - Chat sidebar open/close state
 *   - Active conversation ID
 *   - Theme preference
 *   - Notification panel state
 */
interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
