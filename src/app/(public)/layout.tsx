import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import NextTopLoader from 'nextjs-toploader';
import { FloatingWidgets } from '@/components/public/FloatingWidgets';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg relative">
      <NextTopLoader
        color="#0F766E"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #0F766E,0 0 5px #0F766E"
      />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <FloatingWidgets />
      <Footer />
    </div>
  );
}
