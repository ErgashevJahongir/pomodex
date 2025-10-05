import { setRequestLocale } from 'next-intl/server';
import { ProfilePage } from '@/components/profile/profile-page';
import type { Metadata } from 'next';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Profile | Pomodex',
    description: 'Manage your profile settings and preferences',
  };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfilePage />;
}
