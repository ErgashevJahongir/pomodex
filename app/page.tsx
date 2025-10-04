import { Header } from '@/components/header';
import { Timer } from '@/components/timer';
import { Settings } from '@/components/settings';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <Timer />
        </div>
      </main>
      <Settings />
    </div>
  );
}
