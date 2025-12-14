import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      notificationsEnabled: true,

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      toggleDarkMode: () => {
        const current = get().themeMode;
        // Toggle between dark and light (or use system default behavior)
        if (current === 'dark') {
          set({ themeMode: 'light' });
        } else {
          set({ themeMode: 'dark' });
        }
      },

      setNotificationsEnabled: async (enabled) => {
        set({ notificationsEnabled: enabled });
        
        if (!enabled) {
          // Cancel all scheduled notifications when disabled
          await Notifications.cancelAllScheduledNotificationsAsync();
          console.log('All notifications cancelled');
        }
        // Note: When re-enabled, notifications will be re-scheduled when 
        // vision items are updated or app restarts
      },
    }),
    {
      name: 'vision-board-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
