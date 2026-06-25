'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Truck, Package, Warehouse, Map, FileText, Box, ShieldCheck, 
  Clock, ThumbsUp, Headset, MessageCircle, MapPin, ArrowRight
} from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [lrNumber, setLrNumber] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (lrNumber.trim()) {
      router.push(`/track?lr=${lrNumber}`);
    }
  };

  const services = [
    { title: 'Full Truck Load', icon: <Truck className="w-8 h-8" />, desc: 'Dedicated vehicles for bulk cargo.', link: '/services' },
    { title: 'Part Load / LTL', icon: <Package className="w-8 h-8" />, desc: 'Cost-effective shared transport.', link: '/services' },
    { title: 'Warehousing', icon: <Warehouse className="w-8 h-8" />, desc: 'Secure storage in key logistics hubs.', link: '/services' },
    { title: 'Live Tracking', icon: <Map className="w-8 h-8" />, desc: 'Real-time GPS tracking for your shipments.', link: '/services' },
    { title: 'Billing & LR', icon: <FileText className="w-8 h-8" />, desc: 'Digital invoicing and instant LR generation.', link: '/services' },
    { title: 'Packing', icon: <Box className="w-8 h-8" />, desc: 'Professional packing for zero damage.', link: '/services' },
  ];

  const stats = [
    { value: 250, suffix: '+', label: 'Vehicles' },
    { value: 33, suffix: '', label: 'Districts Covered' },
    { value: 10000, suffix: '+', label: 'Shipments/Month' },
    { value: 15, suffix: '+', label: 'Years of Experience' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-primary-dark text-white overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/30 to-transparent blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 text-sm font-medium text-brand-primary-light tracking-wide shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
                </span>
                Gujarat's #1 Transport Network
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Connecting Gujarat, <br />
                <span className="text-brand-primary-light">Delivering Trust</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed font-light">
                Experience seamless logistics, real-time tracking, and dedicated transport solutions tailored for your business needs across every district.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-brand-secondary hover:bg-brand-secondary-dark text-white shadow-[0_0_20px_rgba(211,47,47,0.4)] active:scale-95 transition-all text-lg px-8 h-14 rounded-full cursor-pointer border-0">
                    Book a Shipment
                  </Button>
                </Link>
                <Link href="/services" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full text-white border-white hover:bg-white hover:text-brand-primary-dark active:scale-95 transition-all text-lg px-8 h-14 rounded-full cursor-pointer bg-transparent">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Interactive/Illustration area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white max-w-md mx-auto lg:ml-auto relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-secondary via-brand-primary-light to-brand-primary"></div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                    <div className="p-2.5 bg-brand-secondary/20 rounded-xl">
                      <MapPin className="text-brand-primary-light w-6 h-6" />
                    </div>
                    Quick Track
                  </h3>
                  <p className="text-sm text-white/80 mb-8 leading-relaxed font-light">Enter your LR number or Reference ID to instantly locate your cargo anywhere in the network.</p>
                  
                  <form onSubmit={handleTrack}>
                    <div className="flex flex-col gap-4">
                      <Input 
                        placeholder="e.g. LR-123456" 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-brand-primary-light focus-visible:border-transparent h-14 rounded-xl text-lg backdrop-blur-sm cursor-text"
                        value={lrNumber}
                        onChange={(e) => setLrNumber(e.target.value)}
                        required
                      />
                      <Button type="submit" className="w-full bg-white hover:bg-gray-100 text-brand-primary-dark font-bold h-14 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group text-lg">
                        Track Shipment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 relative z-20 -mt-10 w-[calc(100%-2rem)] mx-auto max-w-6xl rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-50">
        <div className="px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-gray-100">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center px-4 group"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-primary mb-3 tracking-tight group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={stat.value} duration={2.5} separator="," />
                  <span className="text-brand-secondary">{stat.suffix}</span>
                </div>
                <div className="text-xs md:text-sm text-brand-text-secondary font-bold uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-brand-bg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary mb-6 tracking-tight">Premium Logistics Services</h2>
            <p className="text-brand-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive and robust transport solutions designed for speed, safety, and ultimate reliability across our vast network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link href={service.link} key={index} className="block group cursor-pointer h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 transform translate-x-4 -translate-y-4 scale-150 text-brand-primary rotate-12 group-hover:rotate-0">
                    {service.icon}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-8 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-brand-text-primary mb-4 group-hover:text-brand-primary transition-colors">{service.title}</h3>
                  <p className="text-brand-text-secondary leading-relaxed mb-8 flex-1 text-base">{service.desc}</p>
                  
                  <div className="mt-auto flex items-center text-sm font-bold text-brand-primary uppercase tracking-wide">
                    Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-white overflow-hidden border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 text-brand-primary text-sm font-bold tracking-wider uppercase mb-8">
                The Gujarat Advantage
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary mb-8 leading-tight tracking-tight">Why Partner With Us?</h2>
              <p className="text-brand-text-secondary mb-12 text-lg md:text-xl leading-relaxed">
                With deep-rooted knowledge of Gujarat's logistics network, we ensure your goods reach their destination safely and on time. We combine traditional trust with modern technology.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { icon: <ShieldCheck />, title: '100% Safe Transit', desc: 'Fully insured and tracked cargo handling for peace of mind.' },
                  { icon: <Clock />, title: 'On-time Delivery', desc: 'Strict adherence to operational schedules and SLAs.' },
                  { icon: <ThumbsUp />, title: 'Trusted by 1000+', desc: 'Partner to small businesses and large enterprises alike.' },
                  { icon: <Headset />, title: '24/7 Support', desc: 'Dedicated customer service team always here to help you.' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-5 items-start group">
                    <div className="text-brand-secondary mt-1 p-3 bg-brand-secondary/10 rounded-xl group-hover:bg-brand-secondary group-hover:text-white transition-all duration-300 shadow-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-text-primary text-lg mb-2">{feature.title}</h4>
                      <p className="text-sm text-brand-text-secondary leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] aspect-[4/3] group"
            >
              <div className="absolute inset-0 bg-brand-primary-dark/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
              {/* Unsplash Image for professional look */}
              <img 
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Modern Logistics Truck" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 z-20 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-[280px] border border-white">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-brand-success/10 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-brand-success w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-extrabold text-brand-text-primary text-lg mb-1">Secure Transit</div>
                    <div className="text-sm text-brand-text-secondary font-medium">GPS Monitored Fleet</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-32 bg-brand-primary text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">Ready to ship with us?</h2>
          <p className="text-brand-primary-light mb-12 text-lg md:text-2xl font-light leading-relaxed">
            Get an instant quote and experience the fastest, most reliable logistics service in Gujarat today.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white hover:bg-brand-primary-light text-brand-primary-dark font-extrabold rounded-full px-14 py-8 text-xl active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer">
              Request a Quote Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <Link href="/track" title="Track Shipment">
          <div className="rounded-full w-14 h-14 bg-brand-primary hover:bg-brand-primary-dark shadow-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer hover:-translate-y-1 border-2 border-white">
            <MapPin className="text-white w-6 h-6" />
          </div>
        </Link>
        <Link href="https://wa.me/1234567890" target="_blank" title="WhatsApp Support">
          <div className="rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] shadow-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer hover:-translate-y-1 border-2 border-white">
            <MessageCircle className="text-white w-6 h-6" />
          </div>
        </Link>
      </div>
    </>
  );
}
