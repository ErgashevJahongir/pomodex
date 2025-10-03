import { useTimerStore } from '@/store/timer-store';
import { requestNotificationPermission } from '@/lib/notifications';

export const useSettings = () => {
  const { settings, updateSettings, resetSettings } = useTimerStore();

  const handleUpdateSettings = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
  };

  const handleResetSettings = () => {
    resetSettings();
  };

  const handleRequestNotificationPermission = async () => {
    const hasPermission = await requestNotificationPermission();
    return hasPermission;
  };

  return {
    settings,
    updateSettings: handleUpdateSettings,
    resetSettings: handleResetSettings,
    requestNotificationPermission: handleRequestNotificationPermission,
  };
};
