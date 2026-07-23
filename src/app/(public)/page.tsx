'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Truck, Map, CreditCard, Building2, BarChart3, Users, Calculator, MapPin, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SaaSMarketingHome() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-brand-bg">
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] -z-10" />
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary mb-8 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary mr-2 animate-pulse"></span>
            India's #1 Logistics Management Software
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Digitize Your Transport Business.<br className="hidden md:block"/> Scale with Confidence.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Say goodbye to paper LRs, messy WhatsApp groups, and lost Challans. Manage bookings, fleets, drivers, accounting, and branches from one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/demo">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-8 h-14 font-bold text-lg shadow-lg w-full sm:w-auto">
                Book a Free Demo
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 font-bold text-lg w-full sm:w-auto border-gray-300">
                Explore Features <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="container mx-auto px-4 mt-16 max-w-6xl relative z-10">
          <div className="rounded-xl border border-gray-200/50 bg-white/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl">
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-[16/9] md:aspect-[16/10] relative flex items-center justify-center text-gray-400 group">
              <img 
                src="/images/dashboard-preview.png" 
                alt="LogiMaster Dashboard Preview" 
                className="w-full h-full object-cover object-top border-none group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by 500+ Transporters across Gujarat & India</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div>
              <h3 className="text-3xl font-extrabold text-brand-primary mb-1">2M+</h3>
              <p className="text-sm font-medium text-gray-600">LRs Generated</p>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-brand-primary mb-1">50K+</h3>
              <p className="text-sm font-medium text-gray-600">Vehicles Managed</p>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-brand-primary mb-1">₹500Cr+</h3>
              <p className="text-sm font-medium text-gray-600">Freight Processed</p>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-brand-primary mb-1">100%</h3>
              <p className="text-sm font-medium text-gray-600">GST & E-way Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Old Way vs New Way */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why upgrade to LogiMaster?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Stop managing a multi-lakh business with outdated tools.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-100 bg-red-50/30 shadow-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-2 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">The Old Way</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Handwritten LRs with spelling mistakes",
                    "Searching through WhatsApp for old Challans",
                    "Forgetting to collect Balance Freight",
                    "Manual Excel entry for Driver ledgers",
                    "Missing E-way bill expiries",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-red-500 mt-0.5">✖</span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-primary/20 bg-brand-primary/5 shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-32 h-32 text-brand-primary"/></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-brand-primary p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">The LogiMaster Way</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Generate digital LRs and Challans in 10 seconds",
                    "Instant search for any booking from last 5 years",
                    "Auto-calculated balance and payment reminders",
                    "Automated accounting & profitability per trip",
                    "One-click GST and E-way bill compliance",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-800 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to run a Transport Business</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">12 powerful modules designed specifically for the Indian logistics industry.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "LR Generation", desc: "No more handwritten paperwork, instant & error-free digital Lorry Receipts." },
              { icon: Truck, title: "Lorry Challan", desc: "Challans made simple. Auto-linked to bookings, zero duplicate entry." },
              { icon: Map, title: "Crossing Memo", desc: "Track every crossing point with full visibility of goods movement across routes." },
              { icon: Truck, title: "Lorry Hire Management", desc: "Manage hired vehicles easily. Track third-party trucks alongside your fleet." },
              { icon: ShieldCheck, title: "E-way Bill Ready", desc: "Generate and link E-way Bills directly to bookings. Stay 100% compliant." },
              { icon: MapPin, title: "Fleet Tracking", desc: "Your entire fleet, one dashboard. Real-time vehicle status and documents." },
              { icon: Users, title: "Driver Management", desc: "Manage drivers & KYC effortlessly. License tracking and assignment history." },
              { icon: Calculator, title: "Auto Accounting", desc: "Built-in accounting for transport. Income, expenses, profitability per trip." },
              { icon: CreditCard, title: "Billing & Invoicing", desc: "Professional GST-ready invoices auto-generated and linked to bookings." },
              { icon: Building2, title: "Branch Management", desc: "Manage multiple branches centrally with multi-location control." },
              { icon: Users, title: "Client Management", desc: "Client history, bookings, and outstanding payments, all organized." },
              { icon: BarChart3, title: "Reports & Analytics", desc: "Know your business at a glance. Revenue, fleet utilization, and exportable reports." },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="w-12 h-12 rounded-lg bg-brand-bg flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white text-brand-primary transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/features">
              <Button variant="outline" size="lg" className="rounded-full font-bold">View all features in detail</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 bg-brand-secondary text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Get your business digitized in 4 simple steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sign Up", desc: "Book a demo and our team will set up your secure instance." },
              { step: "02", title: "Set up Data", desc: "Add your branches, trucks, drivers, and regular clients." },
              { step: "03", title: "Start Booking", desc: "Generate LRs and Challans instantly from any device." },
              { step: "04", title: "Track & Grow", desc: "Monitor payments, profitability, and scale your operations." },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-gray-700"></div>}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-brand-primary/20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5"></div>
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to transform your Transport Business?</h2>
          <p className="text-xl text-gray-600 mb-10">Join the fastest growing logistics network. Stop managing paperwork and start managing growth.</p>
          <Link href="/demo">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-10 h-16 font-extrabold text-lg shadow-xl shadow-brand-primary/30 animate-bounce hover:animate-none">
              Book Your Free Demo Now
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" /> No credit card required. Free setup assistance.
          </p>
        </div>
      </section>
    </div>
  );
}
