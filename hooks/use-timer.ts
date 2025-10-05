import { useEffect, useCallback, useRef } from 'react';
import { useTimerStore } from '@/store/timer-store';
import { showNotification } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/client';

const getModeDisplayName = (mode: string): string => {
  switch (mode) {
    case 'pomodoro':
      return 'Pomodoro';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return 'Pomodoro';
  }
};

export const useTimer = () => {
  const {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setMode,
    isAuthenticated,
    setIsAuthenticated,
  } = useTimerStore();
  const hasCompletedRef = useRef(false);

  // User authentication statusini tekshirish
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [setIsAuthenticated]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, tick]);

  // Handle timer completion
  useEffect(() => {
    if (!isRunning && timeLeft === 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;

      // Notification sound is now handled in the store's tick function

      // Show browser notification
      const modeName = getModeDisplayName(mode);
      showNotification(
        `${modeName} Completed!`,
        mode === 'pomodoro'
          ? `Great job! You've completed ${completedPomodoros + 1} pomodoros.`
          : 'Break time is over. Ready for the next pomodoro?'
      );

      // Backend save logic is now handled in the store's tick function

      // Auto-start logic is now handled in the store's tick function
    }

    // Reset hasCompletedRef when timer starts again
    if (timeLeft > 0) {
      hasCompletedRef.current = false;
    }
  }, [
    isRunning,
    timeLeft,
    mode,
    completedPomodoros,
    isAuthenticated,
    settings,
  ]);

  const handleStart = useCallback(() => {
    if (isPaused) {
      startTimer();
    } else {
      startTimer();
    }
  }, [isPaused, startTimer]);

  const handlePause = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  const handleReset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleModeChange = useCallback(
    (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
      setMode(newMode);
    },
    [setMode]
  );

  return {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    handleStart,
    handlePause,
    handleReset,
    handleModeChange,
  };
};
