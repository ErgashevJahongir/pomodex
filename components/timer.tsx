'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTimer } from '@/hooks/use-timer';
import {
  formatTime,
  getProgressPercentage,
  getModeColor,
} from '@/lib/time-utils';
import { useTimerStore } from '@/store/timer-store';
import { useTranslations } from 'next-intl';

export function Timer() {
  const t = useTranslations('timer');
  const {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    handleStart,
    handlePause,
    handleReset,
  } = useTimer();
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
    <Card className="animate-in fade-in-0 zoom-in-95 w-full max-w-2xl border-2 shadow-2xl backdrop-blur-sm transition-all duration-700">
      <CardContent className="p-8 sm:p-12">
        <div className="flex flex-col items-center space-y-10">
          {/* Mode selector */}
          <div className="flex w-full max-w-md flex-wrap justify-center gap-2 sm:flex-nowrap">
            {(['pomodoro', 'shortBreak', 'longBreak'] as const).map(
              (timerMode) => (
                <button
                  key={timerMode}
                  onClick={() => useTimerStore.getState().setMode(timerMode)}
                  disabled={isRunning}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all sm:px-6 ${
                    mode === timerMode
                      ? 'bg-primary text-primary-foreground scale-105 shadow-lg'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  } ${isRunning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {t(timerMode)}
                </button>
              )
            )}
          </div>

          {/* Circular progress timer */}
          <div className="relative">
            <svg
              className="h-72 w-72 -rotate-90 transform sm:h-80 sm:w-80"
              viewBox="0 0 200 200"
            >
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-linear ${getModeColor(mode)}`}
                strokeLinecap="round"
              />
            </svg>

            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`font-mono text-5xl font-bold tabular-nums sm:text-6xl ${getModeColor(mode)}`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-muted-foreground mt-3 text-base font-medium sm:text-lg">
                {t(mode)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              onClick={isRunning ? handlePause : handleStart}
              size="lg"
              className="flex-1 rounded-full px-8 py-6 text-base font-semibold"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  {t('pause')}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {isPaused ? t('resume') : t('start')}
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="flex-1 rounded-full px-8 py-6 text-base font-semibold sm:flex-initial"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              {t('reset')}
            </Button>
          </div>

          {/* Stats */}
          <div className="bg-secondary/50 flex w-full items-center justify-center rounded-xl px-6 py-4 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-muted-foreground text-sm font-medium">
                {t('completedPomodoros')}
              </div>
              <div className="text-foreground mt-1 text-3xl font-bold tabular-nums">
                {completedPomodoros}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
