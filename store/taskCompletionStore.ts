import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Track daily task completions
// Key format: YYYY-MM-DD
// Value: Record of taskId -> completed boolean

interface TaskCompletionState {
  completions: Record<string, boolean>; // taskId -> completed for today
  isLoading: boolean;
  
  // Actions
  loadTodayCompletions: () => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
}

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getStorageKey = () => `task_completions_${getTodayKey()}`;

export const useTaskCompletionStore = create<TaskCompletionState>((set, get) => ({
  completions: {},
  isLoading: false,

  loadTodayCompletions: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(getStorageKey());
      if (stored) {
        set({ completions: JSON.parse(stored), isLoading: false });
      } else {
        set({ completions: {}, isLoading: false });
      }
    } catch (e) {
      console.error("Failed to load completions:", e);
      set({ isLoading: false });
    }
  },

  toggleTaskCompletion: async (taskId: string) => {
    const current = get().completions[taskId] || false;
    const newCompletions = {
      ...get().completions,
      [taskId]: !current,
    };
    
    set({ completions: newCompletions });
    
    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(newCompletions));
    } catch (e) {
      console.error("Failed to save completions:", e);
    }
  },
}));
