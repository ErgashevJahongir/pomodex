import { Header } from '@/components/header';
import { Settings } from '@/components/settings';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-20">{children}</main>
      <Settings />
    </>
  );
}
