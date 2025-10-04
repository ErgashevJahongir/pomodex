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
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <Link href="/">
        <Logo className="w-auto h-11 text-black dark:text-white" />
      </Link>

      <div className="flex items-center space-x-2">
        <LanguageSwitcher />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleTheme')}</span>
        </Button>
      </div>
    </header>
  );
}
