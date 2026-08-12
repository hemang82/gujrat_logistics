'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workEmail: z.string().email('Valid email is required'),
  companyName: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      toast.success('Your message has been sent successfully!', {
        description: 'Our team will get back to you shortly.',
      });
      reset();
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again later or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">Send us a message</h2>
        <p className="text-gray-500 text-sm">Please fill out the form below and we'll get back to you.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input 
              {...register('firstName')}
              placeholder="Enter First Name" 
              className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all ${errors.firstName ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
            />
            {errors.firstName && <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input 
              {...register('lastName')}
              placeholder="Enter Last Name" 
              className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all ${errors.lastName ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
            />
            {errors.lastName && <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.lastName.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Work Email <span className="text-red-500">*</span>
          </label>
          <Input 
            {...register('workEmail')}
            type="email" 
            placeholder="Enter Work Email" 
            className={`h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all ${errors.workEmail ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
          />
          {errors.workEmail && <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.workEmail.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Company Name</label>
          <Input 
            {...register('companyName')}
            placeholder="Enter Company Name" 
            className="h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all" 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea 
            {...register('message')}
            className={`w-full min-h-[140px] rounded-full border border-gray-200 bg-gray-50/50 p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all resize-none ${errors.message ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`} 
            placeholder="Enter Message"
          ></textarea>
          {errors.message && <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.message.message}</p>}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 text-base font-bold bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
        >
          {isSubmitting ? 'Sending Message...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
