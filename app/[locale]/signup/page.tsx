import React from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { Logo } from '@/components/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = React.use(params);
  setRequestLocale(resolvedParams.locale);

  const t = useTranslations('auth');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12 transition-colors sm:px-6 lg:px-8 dark:from-gray-950 dark:via-black dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/5 blur-3xl dark:bg-pink-500/10" />

      <div className="animate-in fade-in-0 zoom-in-95 relative z-10 w-full max-w-md duration-500">
        {/* Logo */}
        <Link href="/" className="mb-8 flex justify-center">
          <Logo className="h-auto w-48 transition-transform hover:scale-105 sm:w-64" />
        </Link>

        {/* Card */}
        <Card className="border-2 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {t('signupTitle')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('signupDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <OAuthButtons />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-3">
                  {t('or')}
                </span>
              </div>
            </div>

            {/* Signup Form */}
            <SignupForm />

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('hasAccount')} </span>
              <Link
                href="/login"
                className="text-primary font-semibold underline-offset-4 transition-colors hover:underline"
              >
                {t('login')}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            ← {t('backToHome', { defaultValue: 'Back to Home' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
