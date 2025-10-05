import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playNotificationSound } from '@/lib/notifications';
import { saveTimerSession, updateTodayStats } from '@/lib/supabase/queries';
import type { TimerModeDB } from '@/lib/supabase/types';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // after how many pomodoros
  notificationSound: string; // sound file name
  soundVolume: number; // 0-100
}

export interface TimerState {
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number; // seconds
  mode: TimerMode;
  completedPomodoros: number;

  // Settings
  settings: TimerSettings;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Authentication state
  isAuthenticated: boolean;
  setIsAuthenticated: (state: boolean) => void;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  notificationSound: 'boxing_bell',
  soundVolume: 70,
};

const getInitialTime = (mode: TimerMode, settings: TimerSettings): number => {
  switch (mode) {
    case 'pomodoro':
      return settings.pomodoro * 60;
    case 'shortBreak':
      return settings.shortBreak * 60;
    case 'longBreak':
      return settings.longBreak * 60;
    default:
      return settings.pomodoro * 60;
  }
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isRunning: false,
      isPaused: false,
      timeLeft: getInitialTime('pomodoro', defaultSettings),
      mode: 'pomodoro',
      completedPomodoros: 0,
      settings: defaultSettings,

      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

      // Authentication state
      isAuthenticated: false,
      setIsAuthenticated: (state) => {
        set({
          isAuthenticated: state,
        });
      },

      // Actions
      startTimer: () => {
        set({ isRunning: true, isPaused: false });
      },

      pauseTimer: () => {
        set({ isRunning: false, isPaused: true });
      },

      resetTimer: () => {
        const { mode, settings } = get();
        set({
          isRunning: false,
          isPaused: false,
          timeLeft: getInitialTime(mode, settings),
        });
      },

      tick: () => {
        const {
          timeLeft,
          isRunning,
          mode,
          settings,
          completedPomodoros,
          isAuthenticated,
        } = get();

        if (!isRunning || timeLeft <= 0) return;

        const newTimeLeft = timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Timer finished
          set({ isRunning: false, isPaused: false });

          // Play notification sound first
          playNotificationSound(
            settings.notificationSound,
            settings.soundVolume
          );

          // Helper function to convert mode to DB format
          const getModeForDB = (mode: TimerMode): TimerModeDB => {
            switch (mode) {
              case 'pomodoro':
                return 'pomodoro';
              case 'shortBreak':
                return 'short_break';
              case 'longBreak':
                return 'long_break';
              default:
                return 'pomodoro';
            }
          };

          // Save timer session to backend (only for authenticated users)
          if (isAuthenticated) {
            let duration: number;
            if (mode === 'pomodoro') {
              duration = settings.pomodoro;
            } else if (mode === 'shortBreak') {
              duration = settings.shortBreak;
            } else {
              duration = settings.longBreak;
            }

            saveTimerSession(getModeForDB(mode), duration).then(
              ({ success }) => {
                if (success) {
                  console.warn('✅ Timer session saved to backend');
                } else {
                  console.error('❌ Failed to save timer session to backend');
                }
              }
            );
          }

          // Handle completion
          if (mode === 'pomodoro') {
            const newCompletedPomodoros = completedPomodoros + 1;
            const shouldTakeLongBreak =
              newCompletedPomodoros % settings.longBreakInterval === 0;

            const newMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';

            set({
              completedPomodoros: newCompletedPomodoros,
              mode: newMode,
              timeLeft: getInitialTime(newMode, settings),
            });

            // Update daily stats for completed pomodoro (only for authenticated users)
            if (isAuthenticated) {
              const totalFocusTime = newCompletedPomodoros * settings.pomodoro;
              updateTodayStats(newCompletedPomodoros, totalFocusTime).then(
                ({ success }) => {
                  if (success) {
                    console.warn('✅ Daily stats updated');
                  } else {
                    console.error('❌ Failed to update daily stats');
                  }
                }
              );
            }

            // Auto-start break if enabled
            if (settings.autoStartBreaks) {
              setTimeout(() => {
                set({ isRunning: true, isPaused: false });
              }, 2000); // 2 soniya kutish - notification uchun vaqt
            }
          } else {
            // Break finished, go back to pomodoro
            set({
              mode: 'pomodoro',
              timeLeft: getInitialTime('pomodoro', settings),
            });

            // Auto-start pomodoro if enabled
            if (settings.autoStartPomodoros) {
              setTimeout(() => {
                set({ isRunning: true, isPaused: false });
              }, 2000); // 2 soniya kutish - notification uchun vaqt
            }
          }
        } else {
          set({ timeLeft: newTimeLeft });
        }
      },

      setMode: (newMode: TimerMode) => {
        const { settings } = get();
        set({
          mode: newMode,
          timeLeft: getInitialTime(newMode, settings),
          isRunning: false,
          isPaused: false,
        });
      },

      updateSettings: (newSettings: Partial<TimerSettings>) => {
        const { settings, mode } = get();
        const updatedSettings = { ...settings, ...newSettings };

        set({
          settings: updatedSettings,
          timeLeft: getInitialTime(mode, updatedSettings),
        });
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          timeLeft: getInitialTime('pomodoro', defaultSettings),
          mode: 'pomodoro',
          isRunning: false,
          isPaused: false,
          completedPomodoros: 0,
        });
      },
    }),
    {
      name: 'pomodoro-timer-storage',
      partialize: (state) => ({
        settings: state.settings,
        completedPomodoros: state.completedPomodoros,
        mode: state.mode, // Timer mode'ni saqlash
        timeLeft: state.timeLeft, // Time left'ni ham saqlash
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Agar timeLeft saqlanmagan bo'lsa yoki noto'g'ri bo'lsa, recalculate qilish
          const expectedTime = getInitialTime(state.mode, state.settings);
          if (
            state.timeLeft !== expectedTime &&
            state.timeLeft > expectedTime
          ) {
            state.timeLeft = expectedTime;
          }

          state.setHasHydrated(true);
        }
      },
    }
  )
);
