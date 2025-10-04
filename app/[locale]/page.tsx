import { Header } from '@/components/header';
import { Timer } from '@/components/timer';
import { Settings } from '@/components/settings';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const title = t('title');
  const description = t('description');

  // Development va production uchun to'g'ri URL
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  const url = `${baseUrl}/${locale}`;
  const image = `${baseUrl}/og-image.png`;

  // Locale mapping
  const localeMap: Record<string, string> = {
    uz: 'uz_UZ',
    ru: 'ru_RU',
    en: 'en_US',
  };
  const ogLocale = localeMap[locale] || 'en_US';

  return {
    title,
    description,
    keywords: [
      'pomodoro',
      'timer',
      'productivity',
      'focus',
      'time management',
      'work timer',
      'study timer',
      'pomodoro technique',
      'pomodoro app',
      'free pomodoro timer',
    ],
    authors: [{ name: 'Pomodex' }],
    creator: 'Pomodex',
    publisher: 'Pomodex',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        uz: `${baseUrl}/uz`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Pomodex',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: ogLocale,
      alternateLocale: ['en_US', 'ru_RU', 'uz_UZ'].filter(
        (l) => l !== ogLocale
      ),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@pomodex',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
  };
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors dark:from-gray-950 dark:via-black dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-red-500/5 blur-3xl dark:bg-red-500/10" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" />

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-20">
          <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
            <h1 className="sr-only">Pomodex - Pomodoro Timer App</h1>
            <Timer />
          </div>
        </main>
      </div>

      <Settings />
    </div>
  );
}
