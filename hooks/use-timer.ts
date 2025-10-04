import { useEffect, useCallback } from 'react';
import { useTimerStore } from '@/store/timer-store';
import { playNotificationSound, showNotification } from '@/lib/notifications';

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
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setMode,
  } = useTimerStore();

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
    if (!isRunning && timeLeft === 0) {
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification
      const modeName = getModeDisplayName(mode);
      showNotification(
        `${modeName} Completed!`,
        mode === 'pomodoro' 
          ? `Great job! You've completed ${completedPomodoros + 1} pomodoros.`
          : 'Break time is over. Ready for the next pomodoro?'
      );
    }
  }, [isRunning, timeLeft, mode, completedPomodoros]);

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

  const handleModeChange = useCallback((newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
  }, [setMode]);

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
