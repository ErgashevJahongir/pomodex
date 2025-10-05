import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/timer-store';
import { requestNotificationPermission } from '@/lib/notifications';
import { getUserSettings, saveUserSettings } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const useSettings = () => {
  const t = useTranslations('settings');
  const { settings, updateSettings, resetSettings } = useTimerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // User authentication statusini tekshirish
  useEffect(() => {
    const supabase = createClient();

    // Offline sessions'ni sync qilish funksiyasi
    const syncOfflineSessionsIfNeeded = async (shouldShowToast = true) => {
      const {
        offlineSessions: currentOfflineSessions,
        syncOfflineSessions: syncSessions,
      } = useTimerStore.getState();

      if (currentOfflineSessions.length > 0) {
        try {
          await syncSessions();
          if (shouldShowToast) {
            toast.success(
              `${currentOfflineSessions.length} ta timer session backendga yuborildi`
            );
          }
        } catch (err) {
          console.error('Error syncing offline sessions:', err);
          if (shouldShowToast) {
            toast.error('Timer sessions sync qilinmadi');
          }
        }
      }
    };

    const initAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const nowAuthenticated = !!user;
      useTimerStore.getState().setIsAuthenticated(nowAuthenticated);
      setIsAuthenticated(nowAuthenticated);

      // Agar allaqachon login bo'lsa va offline sessions bor bo'lsa, bir marta sync
      if (nowAuthenticated) {
        await syncOfflineSessionsIfNeeded(true);
      }
    };

    initAuth();

    // Auth o'zgarishlarini kuzatish
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const wasAuthenticated = isAuthenticated;
      const nowAuthenticated = !!session;

      // Store ichidagi auth holatini ham yangilaymiz
      useTimerStore.getState().setIsAuthenticated(nowAuthenticated);
      setIsAuthenticated(nowAuthenticated);

      // Faqat guest -> logged-in transitionida sync qilamiz
      if (!wasAuthenticated && nowAuthenticated) {
        await syncOfflineSessionsIfNeeded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated]);

  // Zustand hydration'ni kuzatish va settings'ni yuklash
  useEffect(() => {
    // Hydration statusini tekshirish
    const checkHydration = () => {
      const { _hasHydrated } = useTimerStore.getState();

      if (_hasHydrated && isAuthenticated && !hasLoadedOnce) {
        loadSettingsFromSupabase();
      }
    };

    // Darhol tekshirish
    checkHydration();

    // Zustand store'ga subscription
    const unsubscribe = useTimerStore.subscribe((state) => {
      if (state._hasHydrated && isAuthenticated && !hasLoadedOnce) {
        loadSettingsFromSupabase();
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasLoadedOnce]);

  // Supabase'dan settings'ni yuklash
  const loadSettingsFromSupabase = async () => {
    // Faqat birinchi yuklanishda loading indicator ko'rsatish
    if (!hasLoadedOnce) {
      setIsLoading(true);
    }

    const { data, error, isDefault } = await getUserSettings();

    if (data) {
      const newSettings = {
        pomodoro: data.pomodoro_duration,
        shortBreak: data.short_break_duration,
        longBreak: data.long_break_duration,
        autoStartBreaks: data.auto_start_breaks,
        autoStartPomodoros: data.auto_start_pomodoros,
        longBreakInterval: data.long_break_interval,
        notificationSound: data.notification_sound,
        soundVolume: data.sound_volume,
      };

      // Faqat agar settings haqiqatan o'zgargan bo'lsa, update qilish
      const hasChanged =
        settings.pomodoro !== newSettings.pomodoro ||
        settings.shortBreak !== newSettings.shortBreak ||
        settings.longBreak !== newSettings.longBreak ||
        settings.autoStartBreaks !== newSettings.autoStartBreaks ||
        settings.autoStartPomodoros !== newSettings.autoStartPomodoros ||
        settings.longBreakInterval !== newSettings.longBreakInterval ||
        settings.notificationSound !== newSettings.notificationSound ||
        settings.soundVolume !== newSettings.soundVolume;

      if (hasChanged) {
        // Silent update - notification yo'q, flickering yo'q
        updateSettings(newSettings);
      }

      // Agar default settings bo'lsa, birinchi marta database'ga saqlaymiz
      if (isDefault) {
        await saveUserSettings({
          pomodoro_duration: data.pomodoro_duration,
          short_break_duration: data.short_break_duration,
          long_break_duration: data.long_break_duration,
          auto_start_breaks: data.auto_start_breaks,
          auto_start_pomodoros: data.auto_start_pomodoros,
          long_break_interval: data.long_break_interval,
        });
      }
    } else if (error) {
      // Xatolik yuz berdi
      console.error('Failed to load settings:', error);
    }

    setIsLoading(false);
    setHasLoadedOnce(true);
  };

  // Settings'ni Supabase'ga saqlash
  const syncSettingsToSupabase = async (
    newSettings: Partial<typeof settings>
  ) => {
    if (!isAuthenticated) return;

    const { success, error } = await saveUserSettings({
      pomodoro_duration: newSettings.pomodoro,
      short_break_duration: newSettings.shortBreak,
      long_break_duration: newSettings.longBreak,
      auto_start_breaks: newSettings.autoStartBreaks,
      auto_start_pomodoros: newSettings.autoStartPomodoros,
      long_break_interval: newSettings.longBreakInterval,
      notification_sound: newSettings.notificationSound,
      sound_volume: newSettings.soundVolume,
    });

    if (!success) {
      console.error('Failed to sync settings:', error);
      toast.error(t('settingsNotSaved'));
    } else {
      toast.success(t('settingsSaved'));
    }
  };

  const handleUpdateSettings = (newSettings: Partial<typeof settings>) => {
    // Faqat local state'ni yangilaymiz, backendga saqlamaymiz
    updateSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    // Hozirgi settings'ni backendga saqlash
    if (isAuthenticated) {
      await syncSettingsToSupabase(settings);
    }
  };

  const handleResetSettings = () => {
    resetSettings();

    // Agar user login bo'lsa, default settings'ni Supabase'ga saqlash
    if (isAuthenticated) {
      const defaultSettings = {
        pomodoro_duration: 25,
        short_break_duration: 5,
        long_break_duration: 15,
        auto_start_breaks: false,
        auto_start_pomodoros: false,
        long_break_interval: 4,
        notification_sound: 'boxing_bell',
        sound_volume: 70,
      };
      saveUserSettings(defaultSettings).then(({ success }) => {
        if (success) {
          toast.success(t('settingsReset'));
        } else {
          toast.error(t('settingsNotReset'));
        }
      });
    }
  };

  const handleRequestNotificationPermission = async () => {
    const hasPermission = await requestNotificationPermission();
    return hasPermission;
  };

  return {
    settings,
    updateSettings: handleUpdateSettings,
    saveSettings: handleSaveSettings,
    resetSettings: handleResetSettings,
    requestNotificationPermission: handleRequestNotificationPermission,
    isLoading,
    isAuthenticated,
  };
};
