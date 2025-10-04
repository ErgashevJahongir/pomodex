'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/use-timer';
import { formatTime, getProgressPercentage, getModeColor } from '@/lib/time-utils';
import { useTimerStore } from '@/store/timer-store';
import { useTranslations } from 'next-intl';

export function Timer() {
  const t = useTranslations('timer');
  const { isRunning, isPaused, timeLeft, mode, completedPomodoros, handleStart, handlePause, handleReset } = useTimer();
  const { settings } = useTimerStore();

  const getTotalTime = () => {
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

  const totalTime = getTotalTime();
  const progress = getProgressPercentage(timeLeft, totalTime);
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Mode selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((timerMode) => (
          <button
            key={timerMode}
            onClick={() => useTimerStore.getState().setMode(timerMode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === timerMode
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t(timerMode)}
          </button>
        ))}
      </div>

      {/* Circular progress timer */}
      <div className="relative">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-linear ${getModeColor(mode)}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-mono font-bold ${getModeColor(mode)}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t(mode)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <Button
          onClick={isRunning ? handlePause : handleStart}
          size="lg"
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              {t('pause')}
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {isPaused ? t('resume') : t('start')}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="px-8 py-3 rounded-full"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t('reset')}
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('completedPomodoros')}: <span className="font-semibold text-gray-900 dark:text-white">{completedPomodoros}</span>
        </div>
      </div>
    </div>
  );
}
