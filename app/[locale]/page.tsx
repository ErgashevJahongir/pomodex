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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.VERCEL_URL 
                    ? `https://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000';
  
  const url = `${baseUrl}/${locale}`;
  const image = `${baseUrl}/og-image.png`;
  
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
        'en': `${baseUrl}/en`,
        'ru': `${baseUrl}/ru`,
        'uz': `${baseUrl}/uz`,
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
      locale: locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: ['en_US', 'ru_RU', 'uz_UZ'].filter(
        (l) => l !== (locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US')
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
    <div className="min-custom-screen bg-white dark:bg-black transition-colors">
      <Header />
      <main className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-custom-screen">
          <h1 className="sr-only">Pomodex - Pomodoro Timer App</h1>
          <Timer />
        </div>
      </main>
      <Settings />
    </div>
  );
}
