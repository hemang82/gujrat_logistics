import './public.css';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { FloatingWidgets } from '@/components/public/FloatingWidgets';
import { JsonLd } from '@/components/public/JsonLd';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo';
import { LenisProvider } from '@/components/public/LenisProvider';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <div className="public-shell min-h-screen flex flex-col bg-[#F3F7F7] text-[#06262A] relative">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <FloatingWidgets />
        <Footer />
      </div>
    </LenisProvider>
  );
}
