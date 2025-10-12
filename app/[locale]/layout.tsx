import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : 'http://localhost:3000';
const locale = 'en';

export const metadata: Metadata = {
  title: {
    template: '%s | Pomodex',
    default: 'Pomodex - Pomodoro Timer',
  },
  description: 'A beautiful and productive Pomodoro timer app',
  applicationName: 'Pomodex',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pomodex',
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pomodex',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'A beautiful and productive Pomodoro timer app for managing your time effectively',
    url: `${baseUrl}/${locale}`,
    inLanguage: locale,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    screenshot: `${baseUrl}/screenshot.png`,
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors dark:from-gray-950 dark:via-black dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-red-500/5 blur-3xl dark:bg-red-500/10" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
      <Toaster />
    </NextIntlClientProvider>
  );
}
