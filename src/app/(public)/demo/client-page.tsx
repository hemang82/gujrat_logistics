'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const demoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Valid email is required'),
  city: z.string().min(1, 'City is required'),
  fleetSize: z.string().min(1, 'Fleet size is required'),
  painPoint: z.string().min(1, 'Please select your biggest challenge'),
});

type DemoFormValues = z.infer<typeof demoSchema>;

export default function DemoPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      fleetSize: '1-10',
    }
  });

  const onSubmit = async (data: DemoFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit request');
      
      toast.success('Thank you! Our team will contact you shortly.', {
        description: 'Check your email for further details.'
      });
      reset({
        name: '', companyName: '', phone: '', email: '', city: '', fleetSize: '1-10', painPoint: ''
      });
    } catch (err: any) {
      toast.error('Something went wrong', {
        description: err.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 
        {message}
      </p>
    );
  };

  return (
    <div className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side - Dark Premium Presentation */}
          <div className="w-full lg:w-5/12 bg-brand-primary-dark p-10 md:p-16 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-primary/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight leading-tight text-white">
                  Digitize your Transport Business today.
                </h1>
                <p className="text-brand-primary-light text-base mb-10 leading-relaxed">
                  Join hundreds of transporters across India who have switched from messy WhatsApp groups and paper Challans to a unified digital platform.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-6">
                {[
                  "Generate LRs & Challans in 10 seconds",
                  "Auto-calculate freights and driver balances",
                  "100% GST & E-way Bill compliant",
                  "Manage unlimited branches & vehicles"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="bg-brand-primary/20 p-1.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary-light" />
                    </div>
                    <span className="font-medium text-gray-100 text-base">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative z-10 mt-16 pt-10 border-t border-brand-primary/20">
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="font-medium text-gray-200 text-sm md:text-base leading-relaxed">"Trust Logistic completely transformed how we manage our multi-branch transport network. Our daily operations are 10x faster."</p>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center font-bold text-lg text-white">ST</div>
                <div>
                  <div className="font-bold text-base text-white">Shreeji Transport</div>
                  <div className="text-brand-primary-light">Ahmedabad, Gujarat</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Clean Premium Form */}
          <div className="w-full lg:w-7/12 p-8 md:p-16 lg:p-20 bg-white">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Book your Free Demo</h2>
                <p className="text-base text-gray-500 leading-relaxed">Fill out the form below and our logistics experts will contact you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 flex items-center gap-1">Your Name <span className="text-red-500">*</span></Label>
                    <Input 
                      {...register('name')}
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors ${errors.name ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
                      placeholder="Enter Your Name" 
                    />
                    <ErrorMessage message={errors.name?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 flex items-center gap-1">Company Name <span className="text-red-500">*</span></Label>
                    <Input 
                      {...register('companyName')}
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors ${errors.companyName ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
                      placeholder="Enter Company Name" 
                    />
                    <ErrorMessage message={errors.companyName?.message} />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 flex items-center gap-1">Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                      {...register('phone')}
                      type="tel" 
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors ${errors.phone ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
                      placeholder="Enter Phone Number" 
                    />
                    <ErrorMessage message={errors.phone?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 flex items-center gap-1">Email Address <span className="text-red-500">*</span></Label>
                    <Input 
                      {...register('email')}
                      type="email" 
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors ${errors.email ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
                      placeholder="Enter Email Address" 
                    />
                    <ErrorMessage message={errors.email?.message} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 flex items-center gap-1">City / Location <span className="text-red-500">*</span></Label>
                    <Input 
                      {...register('city')}
                      className={`h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors ${errors.city ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
                      placeholder="Enter City" 
                    />
                    <ErrorMessage message={errors.city?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Fleet Size <span className="text-red-500">*</span></Label>
                    <Controller
                      name="fleetSize"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`!w-full !h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary px-3 rounded-full transition-colors ${errors.fleetSize ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}>
                            <SelectValue placeholder="Select Fleet Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1 - 10 Vehicles</SelectItem>
                            <SelectItem value="11-50">11 - 50 Vehicles</SelectItem>
                            <SelectItem value="50+">50+ Vehicles</SelectItem>
                            <SelectItem value="Broker">Broker / No Vehicles</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <ErrorMessage message={errors.fleetSize?.message} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700 flex items-center gap-1">What is your biggest operational challenge? <span className="text-red-500">*</span></Label>
                  <Controller
                    name="painPoint"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className={`!w-full !h-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary px-3 rounded-full transition-colors ${errors.painPoint ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}>
                          <SelectValue placeholder="Select a challenge..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accounting & Pending Payments">Accounting & Pending Payments</SelectItem>
                          <SelectItem value="Manual LR/Challan Entry">Manual LR/Challan Entry</SelectItem>
                          <SelectItem value="E-way Bill Generation">E-way Bill Generation</SelectItem>
                          <SelectItem value="Driver/Fleet Tracking">Driver/Fleet Tracking</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <ErrorMessage message={errors.painPoint?.message} />
                </div>

                <Button disabled={loading} type="submit" className="w-full h-16 mt-4 text-lg font-extrabold bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                  {loading ? 'Submitting Request...' : 'Request My Free Demo'}
                </Button>
                
                <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 mt-6">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" /> Your information is 100% secure.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
