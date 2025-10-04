'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { useTranslations } from 'next-intl';

export function Settings() {
  const t = useTranslations('settings');
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    updateSettings,
    resetSettings,
    requestNotificationPermission,
  } = useSettings();

  const handleSave = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    resetSettings();
  };

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50"
        aria-label={t('title')}
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('title')}
              </h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Timer durations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('timerDurations')}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pomodoroMinutes')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.pomodoro}
                      onChange={(e) =>
                        updateSettings({
                          pomodoro: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shortBreakMinutes')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreak}
                      onChange={(e) =>
                        updateSettings({
                          shortBreak: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('longBreakMinutes')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreak}
                      onChange={(e) =>
                        updateSettings({
                          longBreak: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Auto-start settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('autoStart')}
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) =>
                        updateSettings({ autoStartBreaks: e.target.checked })
                      }
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('autoStartBreaks')}
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) =>
                        updateSettings({ autoStartPomodoros: e.target.checked })
                      }
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('autoStartPomodoros')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Long break interval */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('longBreakInterval')}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('longBreakAfter')}
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      updateSettings({
                        longBreakInterval: parseInt(e.target.value) || 2,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('notifications')}
                </h3>

                <Button
                  onClick={handleRequestPermission}
                  variant="outline"
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t('enableNotifications')}
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  {t('resetToDefaults')}
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {t('saveSettings')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
