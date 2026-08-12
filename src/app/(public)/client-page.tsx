'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Truck, Map, CreditCard, Building2, BarChart3, Users, Calculator, MapPin, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export default function SaaSMarketingHome() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-brand-primary/20">
      
      {/* ===== Hero ===== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#f4f7f6]">
        {/* Background Graphic instead of image to keep it clean, or use a gradient */}
        <div className="absolute inset-0 bg-brand-primary/5 -z-10" />
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10 max-w-7xl">
          {/* Hero Copy (Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left"
          >
            <div className="flex gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" /> 100% Secure
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Cloud ERP
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Transforming Transport into <span className="text-brand-primary">Digital Power</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Trust Logistic specializes in intelligent software for transporters — recovering lost time and money while powering a modern digital logistics economy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo">
                <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-8 h-14 font-semibold text-lg shadow-lg">
                  Get a Free Demo
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="bg-white rounded-full px-8 h-14 font-semibold text-lg border-gray-200">
                  Know Our Process
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual (Right) - Mimicking Accorewaste's floating badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-900"
          >
            <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Transport Logistics" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Daily LRs</p>
                <p className="text-xl font-bold text-gray-900">25,000+</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce" style={{animationDuration: '4s'}}>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Vehicles Tracked</p>
                <p className="text-xl font-bold text-gray-900">10,000+</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              { num: 25000, suffix: "+", label: "LRs Generated Daily" },
              { num: 99, suffix: "%", label: "Safe Digital Process" },
              { num: 15, suffix: "+", label: "Modules Integrated" },
              { num: 100, suffix: "%", label: "E-way Bill Compliant" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="px-4"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-2">
                  <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />{stat.suffix}
                </div>
                <div className="text-sm md:text-base font-semibold text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Intro (Split) ===== */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Left */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-xl"
            >
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Modern Logistics Office" className="w-full h-auto" />
              <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-brand-primary" />
                <div>
                  <div className="text-xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Traceable</div>
                </div>
              </div>
            </motion.div>

            {/* Copy Right */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-primary font-bold uppercase tracking-wider text-sm mb-4 block">Who We Are</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                India's Trusted Partner in <br /> Transport Management
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Trust Logistic is dedicated to the responsible management of your transport business. We help transporters, fleet owners, and brokers operate seamlessly — while recovering lost time and maximizing profitability.
              </p>
              <p className="text-gray-500 mb-8 leading-relaxed">
                From secure LR creation and E-way bill generation to accounting, branch management and fleet tracking, every step is built around compliance, traceability, and business growth.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Certified & Safe</h4>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Business Growth</h4>
                </div>
              </div>
              
              <Link href="/about">
                <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-full px-8 h-12 font-semibold">
                  More About Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Services (Dynamic) ===== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-brand-primary font-bold uppercase tracking-wider text-sm mb-4 block">What We Do</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">End-to-End Transport Solutions</h2>
            <p className="text-lg text-gray-600">From secure booking collection to final delivery and accounting, we manage the full lifecycle of your logistics operation transparently.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Booking & LR Management", desc: "Secure digital generation and transportation of Lorry Receipts across all your branches." },
              { icon: ShieldCheck, title: "Data Security & Backup", desc: "Certified cloud servers ensuring complete confidentiality and 100% data safety." },
              { icon: Building2, title: "Branch Operations", desc: "Responsible management of multiple branches, users, and permissions centrally." },
              { icon: Calculator, title: "Finance & Accounting", desc: "Specialized processing of transport ledgers, auto-calculated freight, and expenses." },
              { icon: Truck, title: "Fleet & Driver Tracking", desc: "Recovery of lost time through intelligent fleet monitoring and driver KYC management." },
              { icon: Map, title: "E-way Bill Integration", desc: "Customized E-way bill generation for transporters, ensuring full GST compliance." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{service.desc}</p>
                <Link href="/features" className="inline-flex items-center text-brand-primary font-semibold text-sm hover:text-brand-primary-dark">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Process ===== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-brand-primary font-bold uppercase tracking-wider text-sm mb-4 block">Our Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">How We Recover Value from Operations</h2>
            <p className="text-lg text-gray-600">A traceable, four-stage process designed for maximum efficiency and minimum manual effort.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-gray-100 -z-10" />
            
            {[
              { num: "1", title: "Book", desc: "Safe creation and inventory of LRs with full chain-of-custody tracking." },
              { num: "2", title: "Dispatch", desc: "Challans are generated and hired vehicles are allocated for safe transit." },
              { num: "3", title: "Track", desc: "Crossings and expenses are recorded using digital eco-conscious methods." },
              { num: "4", title: "Settle", desc: "Freight is accounted, invoices are purified, and payments returned to supply chain." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-white border-2 border-brand-primary text-brand-primary rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/features">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 h-12 font-semibold">
                Explore the Full Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Impact (Dark) ===== */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-primary font-bold uppercase tracking-wider text-sm mb-4 block">Our Impact</span>
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Digitizing Today for a <br /> Profitable Tomorrow
              </h2>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                Every booking we process keeps manual errors out of your ledgers and reduces the need for destructive paper-based management.
              </p>
              
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                {[
                  { num: 48000, suffix: "+", label: "Hours saved annually" },
                  { num: 99, suffix: "%", label: "Diverted from manual errors" },
                  { num: 500, suffix: "+", label: "Transport organisations served" },
                  { num: 25, suffix: "+", label: "Crores of freight managed" }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-extrabold text-white mb-1">
                      <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />{stat.suffix}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
            >
              <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Transport Trucks" className="w-full h-auto opacity-80 mix-blend-luminosity" />
              <div className="absolute bottom-6 left-6 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 border border-gray-700">
                <ShieldCheck className="w-6 h-6 text-brand-primary" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Powering Digital Logistics</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA Band ===== */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-primary rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
          >
            {/* Background texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to Digitize Responsibly?</h2>
              <p className="text-lg md:text-xl text-brand-primary-light mb-10 max-w-2xl mx-auto opacity-90">
                Partner with Trust Logistic for compliant, transparent, and profitable transport management. Request a free assessment for your organisation today.
              </p>
              <Link href="/demo">
                <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-50 rounded-full px-10 h-14 font-bold text-lg shadow-lg">
                  Get a Free Quote
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
