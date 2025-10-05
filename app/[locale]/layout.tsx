import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
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
