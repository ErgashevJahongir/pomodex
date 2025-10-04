'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';
import { useTranslations } from 'next-intl';

export function Header() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('header');

  return (
    <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
      <Link aria-label={t('home')} href="/">
        <Logo className="h-11 w-auto text-black dark:text-white" />
      </Link>

      <div className="flex items-center space-x-2">
        <LanguageSwitcher />

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t('toggleTheme')}</span>
        </Button>
      </div>
    </header>
  );
}
