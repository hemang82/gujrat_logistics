import { Truck, Package, Warehouse, Map, FileText, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Services - Gujarat Logistic',
  description: 'Explore our logistics services in Gujarat.',
};

export default function ServicesPage() {
  const services = [
    { title: 'Full Truck Load (FTL)', icon: <Truck className="w-10 h-10" />, desc: 'Dedicated vehicles for your bulk cargo across Gujarat with complete safety and timely delivery.' },
    { title: 'Part Load / LTL', icon: <Package className="w-10 h-10" />, desc: 'Cost-effective shared transport for smaller shipments without compromising on delivery speed.' },
    { title: 'Warehousing Solutions', icon: <Warehouse className="w-10 h-10" />, desc: 'Secure, modern storage facilities in key logistics hubs with real-time inventory management.' },
    { title: 'Live Tracking', icon: <Map className="w-10 h-10" />, desc: 'Real-time GPS tracking for all your shipments, giving you complete visibility of your cargo.' },
    { title: 'Billing & LR Generation', icon: <FileText className="w-10 h-10" />, desc: 'Digital invoicing and instant Lorry Receipt (LR) generation for hassle-free paperwork.' },
    { title: 'Packing & Moving', icon: <Box className="w-10 h-10" />, desc: 'Professional packing to ensure zero damage during transit for sensitive and fragile items.' },
  ];

  return (
    <div className="pt-32 pb-20 bg-brand-bg">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary mb-4">Our Services</h1>
          <p className="text-brand-text-secondary max-w-2xl mx-auto text-lg">
            We provide comprehensive, end-to-end logistics solutions tailored to meet the unique demands of businesses across Gujarat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="text-brand-primary mb-8 bg-brand-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-brand-text-primary mb-4">{service.title}</h3>
              <p className="text-brand-text-secondary leading-relaxed mb-8 flex-1">
                {service.desc}
              </p>
              <Link href="/contact" className="mt-auto">
                <Button variant="outline" className="w-full h-14 rounded-xl text-brand-primary border-2 border-brand-primary/20 hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all font-bold text-lg">
                  Request this service
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
