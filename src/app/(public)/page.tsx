'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, Truck, Map, CreditCard, Building2, BarChart3, Users, Calculator, MapPin, XCircle, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function SaaSMarketingHome() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-brand-primary/20">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-brand-bg">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] -z-10" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"
        />

        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-brand-primary/20 bg-white/60 backdrop-blur-sm px-4 py-1.5 text-sm text-brand-primary mb-8 font-semibold shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-primary mr-2 animate-pulse"></span>
            India's #1 Logistics Management Software
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
          >
            Digitize Your Transport Business.<br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">
              Scale with Confidence.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Say goodbye to paper LRs, messy WhatsApp groups, and lost Challans. Manage bookings, fleets, drivers, accounting, and branches from one powerful dashboard.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/demo">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-8 h-14 font-bold text-lg shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all hover:-translate-y-1 w-full sm:w-auto flex items-center gap-2 group">
                Book a Free Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-md rounded-full px-8 h-14 font-bold text-lg w-full sm:w-auto border-gray-200 hover:border-gray-300 hover:bg-white shadow-sm transition-all">
                <PlayCircle className="mr-2 w-5 h-5 text-gray-500" /> See How it Works
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="container mx-auto px-4 mt-20 max-w-6xl relative z-10"
        >
          <div className="rounded-2xl border border-white/40 bg-white/40 p-2 md:p-4 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-white relative flex items-center justify-center group shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
              <img 
                src="/images/dashboard-preview.png" 
                alt="Trust Logistic Dashboard Preview" 
                className="w-full h-auto border-none group-hover:scale-[1.01] transition-transform duration-700 ease-out" 
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Trust Bar */}
      <section className="py-16 border-y border-gray-100 bg-white relative z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">Trusted by 500+ Transporters across Gujarat & India</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              { num: 2, suffix: "M+", label: "LRs Generated" },
              { num: 50, suffix: "K+", label: "Vehicles Managed" },
              { num: 500, prefix: "₹", suffix: "Cr+", label: "Freight Processed" },
              { num: 100, suffix: "%", label: "GST & E-way Compliant" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h3 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-2 tracking-tight">
                  {stat.prefix}
                  <CountUp end={stat.num} duration={2.5} enableScrollSpy scrollSpyOnce />
                  {stat.suffix}
                </h3>
                <p className="text-sm md:text-base font-semibold text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Old Way vs New Way */}
      <section className="py-24 bg-gray-50/50 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why upgrade to Trust Logistic?</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Stop managing a multi-lakh business with outdated tools and chaotic spreadsheets.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 lg:gap-12"
          >
            <motion.div variants={scaleIn}>
              <Card className="border-red-100 bg-white shadow-xl shadow-red-900/5 hover:shadow-red-900/10 transition-shadow h-full">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-red-50">
                    <div className="bg-red-50 p-3 rounded-2xl">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">The Old Way</h3>
                  </div>
                  <ul className="space-y-6">
                    {[
                      "Handwritten LRs with spelling mistakes",
                      "Searching through WhatsApp for old Challans",
                      "Forgetting to collect Balance Freight",
                      "Manual Excel entry for Driver ledgers",
                      "Missing E-way bill expiries",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-600 font-medium">
                        <div className="mt-1 bg-red-50 rounded-full p-1"><XCircle className="w-4 h-4 text-red-500" /></div> 
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="border-brand-primary/20 bg-white shadow-xl shadow-brand-primary/5 hover:shadow-brand-primary/10 transition-shadow h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
                  <ShieldCheck className="w-48 h-48 text-brand-primary"/>
                </div>
                <CardContent className="p-8 md:p-10 relative z-10">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-primary/10">
                    <div className="bg-brand-primary/10 p-3 rounded-2xl">
                      <CheckCircle2 className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">The Trust Logistic Way</h3>
                  </div>
                  <ul className="space-y-6">
                    {[
                      "Generate digital LRs and Challans in 10 seconds",
                      "Instant search for any booking from last 5 years",
                      "Auto-calculated balance and payment reminders",
                      "Automated accounting & profitability per trip",
                      "One-click GST and E-way bill compliance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-800 font-semibold">
                        <div className="mt-1 bg-brand-primary/10 rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-brand-primary" /></div> 
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Everything you need to run<br className="hidden md:block"/> a Transport Business</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">12 powerful modules designed specifically for the Indian logistics industry, packed into one beautiful interface.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              { icon: FileText, title: "LR Generation", desc: "No more handwritten paperwork, instant & error-free digital Lorry Receipts." },
              { icon: Truck, title: "Lorry Challan", desc: "Challans made simple. Auto-linked to bookings, zero duplicate entry." },
              { icon: Map, title: "Crossing Memo", desc: "Track every crossing point with full visibility of goods movement across routes." },
              { icon: Truck, title: "Lorry Hire", desc: "Manage hired vehicles easily. Track third-party trucks alongside your fleet." },
              { icon: ShieldCheck, title: "E-way Bill Ready", desc: "Generate and link E-way Bills directly to bookings. Stay 100% compliant." },
              { icon: MapPin, title: "Fleet Tracking", desc: "Your entire fleet, one dashboard. Real-time vehicle status and documents." },
              { icon: Users, title: "Driver Management", desc: "Manage drivers & KYC effortlessly. License tracking and assignment history." },
              { icon: Calculator, title: "Auto Accounting", desc: "Built-in accounting for transport. Income, expenses, profitability per trip." },
              { icon: CreditCard, title: "Billing & Invoicing", desc: "Professional GST-ready invoices auto-generated and linked to bookings." },
              { icon: Building2, title: "Branch Control", desc: "Manage multiple branches centrally with multi-location user control." },
              { icon: Users, title: "Client Directory", desc: "Client history, bookings, and outstanding payments, all perfectly organized." },
              { icon: BarChart3, title: "Smart Reports", desc: "Know your business at a glance. Revenue, fleet utilization, and exportable reports." },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <div className="group p-8 rounded-3xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 bg-white h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
                  <div className="w-14 h-14 rounded-2xl bg-brand-bg flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white text-brand-primary transition-colors duration-300 relative z-10">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed relative z-10 font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link href="/features">
              <Button variant="outline" size="lg" className="rounded-full font-bold px-8 h-14 hover:bg-brand-bg border-gray-200">
                View all features in detail
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 bg-brand-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How it works</h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">Get your business digitized in 4 simple steps.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8 relative"
          >
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            
            {[
              { step: "01", title: "Sign Up", desc: "Book a demo and our team will set up your secure instance." },
              { step: "02", title: "Set up Data", desc: "Add your branches, trucks, drivers, and regular clients." },
              { step: "03", title: "Start Booking", desc: "Generate LRs and Challans instantly from any device." },
              { step: "04", title: "Track & Grow", desc: "Monitor payments, profitability, and scale your operations." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center font-black text-xl mb-6 shadow-xl group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:-translate-y-2 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-primary/5"></div>
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">Ready to transform your Transport Business?</h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">Join the fastest growing logistics network. Stop managing paperwork and start managing growth.</p>
            <Link href="/demo">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-12 h-16 font-extrabold text-xl shadow-2xl shadow-brand-primary/40 hover:shadow-brand-primary/60 transition-all hover:-translate-y-1">
                Book Your Free Demo Now
              </Button>
            </Link>
            <p className="mt-8 text-sm text-gray-500 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" /> No credit card required. Free setup assistance.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
