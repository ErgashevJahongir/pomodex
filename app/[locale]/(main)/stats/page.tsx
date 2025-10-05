import { setRequestLocale } from 'next-intl/server';
import { StatsPage } from '@/components/stats/stats-page';

interface StatsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Stats({ params }: StatsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StatsPage />;
}
