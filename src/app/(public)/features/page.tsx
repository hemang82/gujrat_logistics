import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Truck, Map, ShieldCheck, MapPin, Users, Calculator, CreditCard, Building2, BarChart3 } from 'lucide-react';

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
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Powerful Features Built for Indian Transport</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover how LogiMaster streamlines every aspect of your logistics business.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((mod, i) => (
            <div key={i} className="flex gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-16 h-16 shrink-0 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <mod.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{mod.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-white p-12 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to see these features in action?</h2>
          <Link href="/demo">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-10 h-14 font-bold text-lg">
              Book a Free Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
