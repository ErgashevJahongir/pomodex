'use client';

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  X,
  Bell,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { useTimerStore } from '@/store/timer-store';
import { useTranslations } from 'next-intl';
import { playNotificationSound } from '@/lib/notifications';
import { LanguageSwitcher } from './language-switcher';

export function Settings() {
  const t = useTranslations('settings');
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    requestNotificationPermission,
  } = useSettings();
  const { _hasHydrated } = useTimerStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Agar hydration tugamagan bo'lsa, button disabled
  const isReady = isClient && _hasHydrated;

  const handleSave = async () => {
    await saveSettings();
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
      {/* Floating Settings Button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('title')}
        disabled={!isReady}
      >
        <SettingsIcon className="h-6 w-6" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
          onClick={() => setIsOpen(false)}
        >
          <Card
            className="animate-in zoom-in-95 w-full max-w-2xl border-2 shadow-2xl duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="text-primary h-6 w-6" />
                  <CardTitle className="text-2xl">{t('title')}</CardTitle>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={t('close')}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
              {/* Timer durations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('timerDurations')}</h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pomodoro">{t('pomodoroMinutes')}</Label>
                    <Input
                      id="pomodoro"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.pomodoro}
                      onChange={(e) =>
                        updateSettings({
                          pomodoro: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortBreak">{t('shortBreakMinutes')}</Label>
                    <Input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreak}
                      onChange={(e) =>
                        updateSettings({
                          shortBreak: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longBreak">{t('longBreakMinutes')}</Label>
                    <Input
                      id="longBreak"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreak}
                      onChange={(e) =>
                        updateSettings({
                          longBreak: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Auto-start settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('autoStart')}</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="autoStartBreaks"
                        className="cursor-pointer"
                      >
                        {t('autoStartBreaks')}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {t('autoStartBreaksDesc')}
                      </p>
                    </div>
                    <Switch
                      id="autoStartBreaks"
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) =>
                        updateSettings({ autoStartBreaks: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="autoStartPomodoros"
                        className="cursor-pointer"
                      >
                        {t('autoStartPomodoros')}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {t('autoStartPomodorosDesc')}
                      </p>
                    </div>
                    <Switch
                      id="autoStartPomodoros"
                      checked={settings.autoStartPomodoros}
                      onCheckedChange={(checked) =>
                        updateSettings({ autoStartPomodoros: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Long break interval */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t('longBreakInterval')}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="longBreakInterval">
                    {t('longBreakAfter')}
                  </Label>
                  <Input
                    id="longBreakInterval"
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      updateSettings({
                        longBreakInterval: parseInt(e.target.value) || 2,
                      })
                    }
                  />
                  <p className="text-muted-foreground text-sm">
                    {t('longBreakIntervalDesc')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('notifications')}</h3>

                <Button
                  onClick={handleRequestPermission}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  {t('enableNotifications')}
                </Button>

                {/* Notification Sound */}
                <div className="space-y-2">
                  <Label htmlFor="notification-sound">
                    {t('notificationSound')}
                  </Label>
                  <Select
                    value={settings.notificationSound}
                    onValueChange={(value) =>
                      updateSettings({ notificationSound: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('notificationSound')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxing_bell">
                        {t('boxingBell')}
                      </SelectItem>
                      <SelectItem value="doorbell">{t('doorbell')}</SelectItem>
                      <SelectItem value="cute_sound">
                        {t('cuteSound')}
                      </SelectItem>
                      <SelectItem value="magical_bell">
                        {t('magicalBell')}
                      </SelectItem>
                      <SelectItem value="pop">{t('pop')}</SelectItem>
                      <SelectItem value="work">{t('work')}</SelectItem>
                      <SelectItem value="ohno">{t('ohno')}</SelectItem>
                      <SelectItem value="what">{t('what')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      playNotificationSound(
                        settings.notificationSound,
                        settings.soundVolume
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {t('testSound')}
                  </Button>
                </div>

                {/* Sound Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-volume">{t('soundVolume')}</Label>
                    <span className="text-muted-foreground text-sm font-medium">
                      {settings.soundVolume}%
                    </span>
                  </div>
                  <Slider
                    id="sound-volume"
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.soundVolume]}
                    onValueChange={(value) =>
                      updateSettings({ soundVolume: value[0] })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Theme and Language Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ko&apos;rinish va Til</h3>

                {/* Theme Toggle */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">Mavzu</Label>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {theme === 'dark' ? "Qorong'u mavzu" : "Yorug' mavzu"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }
                      className="h-8"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Yorug&apos;
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Qorong&apos;u
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">Til</Label>
                  <div className="rounded-lg border p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </CardContent>

            <Separator />

            {/* Action buttons */}
            <CardContent className="flex gap-3 p-6 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('resetToDefaults')}
              </Button>
              <Button onClick={handleSave} className="flex-1" size="lg">
                {t('saveSettings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
