import { Header } from '@/components/header';
import { Timer } from '@/components/timer';
import { Settings } from '@/components/settings';

export default function Home() {
  return (
    <div className="min-custom-screen bg-white dark:bg-black transition-colors">
      <Header />
      <main className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-custom-screen">
          <Timer />
        </div>
      </main>
      <Settings />
    </div>
  );
}
