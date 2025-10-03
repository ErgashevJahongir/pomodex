// Time formatting utilities
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getProgressPercentage = (timeLeft: number, totalTime: number): number => {
  if (totalTime === 0) return 0;
  return ((totalTime - timeLeft) / totalTime) * 100;
};

export const getModeDisplayName = (mode: string): string => {
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

export const getModeColor = (mode: string): string => {
  switch (mode) {
    case 'pomodoro':
      return 'text-red-500';
    case 'shortBreak':
      return 'text-green-500';
    case 'longBreak':
      return 'text-blue-500';
    default:
      return 'text-red-500';
  }
};
