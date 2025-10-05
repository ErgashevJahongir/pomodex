'use client';

import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = (params.locale as Locale) || 'en';

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <SelectValue placeholder="Til tanlang" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getFlagEmoji(locale)}</span>
              <span>{localeNames[locale]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Flag emoji helper function
function getFlagEmoji(locale: string): string {
  const flagMap: Record<string, string> = {
    uz: '🇺🇿',
    en: '🇺🇸',
    ru: '🇷🇺',
  };
  return flagMap[locale] || '🌍';
}
