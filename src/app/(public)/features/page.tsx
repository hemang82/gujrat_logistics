import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Truck, Map, ShieldCheck, MapPin, Users, Calculator, CreditCard, Building2, BarChart3 } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export default function FeaturesPage() {
  const modules = [
    { icon: FileText, title: "LR Generation", desc: "Generate LRs in seconds. No more handwritten paperwork, instant & error-free." },
    { icon: Truck, title: "Lorry Challan", desc: "Challans made simple. Auto-linked to bookings, zero duplicate entry." },
    { icon: Map, title: "Crossing Memo", desc: "Track every crossing point. Full visibility of goods movement across routes." },
    { icon: Truck, title: "Lorry Hire Management", desc: "Manage hired vehicles easily. Track third-party trucks alongside your own fleet." },
    { icon: ShieldCheck, title: "E-way Bill Ready", desc: "E-way Bill without the hassle. Generate/link E-way Bills directly to bookings, stay compliant." },
    { icon: MapPin, title: "Fleet Management", desc: "Your entire fleet, one dashboard. Real-time vehicle status, documents, maintenance." },
    { icon: Users, title: "Driver Management", desc: "Manage drivers & KYC effortlessly. License tracking, expiry alerts, assignment history." },
    { icon: Calculator, title: "Accounting", desc: "Built-in accounting for transport. Income, expenses, profitability per trip/vehicle." },
    { icon: CreditCard, title: "Billing & Invoicing", desc: "Professional invoices, auto-generated. GST-ready billing linked to bookings." },
    { icon: Building2, title: "Branch Management", desc: "Manage multiple branches centrally. Multi-location control from one login." },
    { icon: Users, title: "Client Management", desc: "All your clients, organized. Client history, bookings, outstanding payments." },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Know your business at a glance. Revenue, fleet utilization, exportable reports." },
  ];

  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <AnimatedSection className="text-center mb-16">
          <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Powerful Features Built for Indian Transport</h1>
          <p className="max-w-2xl mx-auto text-base text-gray-600 leading-relaxed">Discover how Trust Logistic streamlines every aspect of your logistics business.</p>
        </AnimatedSection>

        <AnimatedStaggerContainer className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {modules.map((mod, i) => (
            <AnimatedStaggerItem key={i}>
              <div className="flex gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/30 transition-all duration-500 group h-full">
                <div className="w-14 h-14 shrink-0 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                  <mod.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">{mod.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStaggerContainer>

        <AnimatedSection delay={0.2} className="mt-20 text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Ready to see these features in action?</h2>
          <Link href="/demo">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-10 h-14 font-bold text-lg shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:-translate-y-0.5">
              Book a Free Demo
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </main>
  );}


export const metadata: Metadata = {
  title: 'Features - Trust Logistic Software',
  description: 'Explore the powerful features of Trust Logistic: E-way bill integration, fleet tracking, branch accounting, and seamless booking management.',
  alternates: {
    canonical: 'https://trustlogistic.in/features',
  }
};
