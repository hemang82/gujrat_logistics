'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    console.log(values);
    toast.success('Message sent successfully! We will get back to you soon.');
    reset();
  }

  return (
    <div className="pt-32 pb-20 bg-brand-bg min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary mb-4">Contact Us</h1>
          <p className="text-brand-text-secondary text-lg max-w-2xl mx-auto">
            Have a question or need a custom logistics solution? Reach out to our team and we'll be happy to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-brand-text-primary mb-8">Get In Touch</h2>
              
              <div className="flex flex-col gap-8">
                <div className="flex gap-4 items-start">
                  <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text-primary mb-1">Head Office</h3>
                    <p className="text-sm text-brand-text-secondary leading-relaxed">
                      123 Logistics Park, SG Highway,<br />
                      Ahmedabad, Gujarat 380015
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text-primary mb-1">Phone Number</h3>
                    <p className="text-sm text-brand-text-secondary mb-1">+91 98765 43210</p>
                    <p className="text-sm text-brand-text-secondary">+91 98765 43211</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text-primary mb-1">Email Address</h3>
                    <p className="text-sm text-brand-text-secondary mb-1">info@gujaratlogistic.com</p>
                    <p className="text-sm text-brand-text-secondary">support@gujaratlogistic.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-brand-primary/10 p-3 rounded-full text-brand-primary shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text-primary mb-1">Business Hours</h3>
                    <p className="text-sm text-brand-text-secondary mb-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
                    <p className="text-sm text-brand-text-secondary">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-brand-text-primary mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" className="bg-gray-50 h-14 rounded-xl px-4" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="bg-gray-50 h-14 rounded-xl px-4" {...register('email')} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 9876543210" className="bg-gray-50 h-14 rounded-xl px-4" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" className="bg-gray-50 h-14 rounded-xl px-4" {...register('subject')} />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject.message as string}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Write your message here..." 
                    className="bg-gray-50 min-h-[150px] rounded-xl p-4" 
                    {...register('message')} 
                  />
                  {errors.message && <p className="text-sm text-red-500">{errors.message.message as string}</p>}
                </div>

                <Button type="submit" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white px-10 h-14 rounded-xl text-lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
