import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // after how many pomodoros
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
        const { timeLeft, isRunning, mode, settings, completedPomodoros } =
          get();

        if (!isRunning || timeLeft <= 0) return;

        const newTimeLeft = timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Timer finished
          set({ isRunning: false, isPaused: false });

          // Handle completion
          if (mode === 'pomodoro') {
            const newCompletedPomodoros = completedPomodoros + 1;
            const shouldTakeLongBreak =
              newCompletedPomodoros % settings.longBreakInterval === 0;

            set({
              completedPomodoros: newCompletedPomodoros,
              mode: shouldTakeLongBreak ? 'longBreak' : 'shortBreak',
              timeLeft: getInitialTime(
                shouldTakeLongBreak ? 'longBreak' : 'shortBreak',
                settings
              ),
            });
          } else {
            // Break finished, go back to pomodoro
            set({
              mode: 'pomodoro',
              timeLeft: getInitialTime('pomodoro', settings),
            });
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
      }),
    }
  )
);
