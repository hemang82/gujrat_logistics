'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitDemoLead } from '@/app/(public)/actions';
import { getWhatsAppUrl } from '@/lib/company';
import { FieldError } from './FieldError';

interface LeadFormProps {
  variant?: 'light' | 'dark';
  sourceLabel?: string;
}

const FLEET_OPTIONS = [
  { value: '1-5', label: '1 – 5 Vehicles' },
  { value: '6-20', label: '6 – 20 Vehicles' },
  { value: '21-50', label: '21 – 50 Vehicles' },
  { value: '50+', label: '50+ Vehicles' },
  { value: 'Broker / Agency', label: 'Transport Broker / Commission Agency' },
];

export function LeadForm({
  variant = 'light',
  sourceLabel = 'Request your free walkthrough',
}: LeadFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    city: '',
    fleetSize: '1-5',
    email: '',
    message: '',
    website: '', // Honeypot
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateClient = () => {
    const errs: Record<string, string> = {};
    if (formData.name.trim().length < 2) errs.name = 'Please enter your full name';
    if (!/^[+\d\s()-]{10,20}$/.test(formData.phone.trim()))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (formData.company.trim().length < 2)
      errs.company = 'Please enter your company or transport firm name';
    if (formData.city.trim().length < 2) errs.city = 'Please enter your city';
    if (!formData.fleetSize) errs.fleetSize = 'Please select your fleet size';
    if (formData.message.trim().length < 4)
      errs.message = 'Please share a brief note about your operational workflow';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitDemoLead(formData);
      if (!result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setFormError(result.error || 'Please review your details and try again.');
        toast.error(result.error || 'Submission error');
        return;
      }

      toast.success('Demo request received!');
      router.push('/request-a-demo/thank-you/');
    } catch {
      setFormError('Network error while submitting. Please try again.');
      toast.error('Network error while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = variant === 'dark';
  const cardClasses = isDark
    ? 'bg-white text-[#06262A] shadow-2xl border border-white/20'
    : 'bg-white text-[#06262A] shadow-[0_20px_60px_rgba(6,38,42,0.08)] border border-[#0F766E]/12';

  const inputBase =
    'w-full h-10 rounded-xl border bg-[#F3F7F7]/65 px-3 text-base font-medium text-[#06262A] placeholder:text-[#52666B]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 focus:border-[#0F766E] transition-colors';

  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${cardClasses}`}>
      <div className="mb-3">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#06262A] tracking-tight">
          {sourceLabel}
        </h3>
        <p className="mt-0.5 text-base text-[#52666B] leading-snug">
          Share your business details and our product specialists will arrange a live walkthrough.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-1.5 sm:space-y-2">
        {/* Honeypot anti-spam field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="demo-website-hp">Website</label>
          <input
            id="demo-website-hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label htmlFor="demo-name" className="block text-sm font-bold text-[#06262A] mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="demo-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Rajesh Patel"
              value={formData.name}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.name ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <label htmlFor="demo-phone" className="block text-sm font-bold text-[#06262A] mb-1">
              Phone / WhatsApp <span className="text-red-600">*</span>
            </label>
            <input
              id="demo-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+91 98XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.phone ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.phone} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label htmlFor="demo-company" className="block text-sm font-bold text-[#06262A] mb-1">
              Company / Transport Name <span className="text-red-600">*</span>
            </label>
            <input
              id="demo-company"
              name="company"
              type="text"
              required
              autoComplete="organization"
              placeholder="Your Transport Company"
              value={formData.company}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.company ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.company} />
          </div>

          <div>
            <label htmlFor="demo-city" className="block text-sm font-bold text-[#06262A] mb-1">
              City <span className="text-red-600">*</span>
            </label>
            <input
              id="demo-city"
              name="city"
              type="text"
              required
              placeholder="e.g. Ahmedabad, Surat, Mumbai"
              value={formData.city}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.city ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.city} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label htmlFor="demo-fleet" className="block text-sm font-bold text-[#06262A] mb-1">
              Fleet Size / Business Type <span className="text-red-600">*</span>
            </label>
            <select
              id="demo-fleet"
              name="fleetSize"
              value={formData.fleetSize}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.fleetSize ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            >
              {FLEET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.fleetSize} />
          </div>

          <div>
            <label htmlFor="demo-email" className="block text-sm font-bold text-[#06262A] mb-1">
              Email Address <span className="text-[#52666B] font-normal">(Optional)</span>
            </label>
            <input
              id="demo-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.in"
              value={formData.email}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.email ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.email} />
          </div>
        </div>

        <div>
          <label htmlFor="demo-message" className="block text-sm font-bold text-[#06262A] mb-1">
            What would you like to see in the demo? <span className="text-red-600">*</span>
          </label>
          <textarea
            id="demo-message"
            name="message"
            rows={2}
            required
            placeholder="e.g. Digital LR / Bilty booking, E-Way Bill via GSP, branch accounting, freight billing..."
            value={formData.message}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-[#F3F7F7]/65 p-2.5 text-base font-medium text-[#06262A] placeholder:text-[#52666B]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 focus:border-[#0F766E] transition-colors ${
              fieldErrors.message ? 'border-red-500' : 'border-[#0F766E]/25'
            }`}
          />
          <FieldError message={fieldErrors.message} />
        </div>

        <div className="pt-1 grid grid-cols-1 sm:flex sm:flex-row gap-2.5">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-[#06262A] font-extrabold text-base px-5 py-3 shadow-[0_10px_25px_rgba(245,158,11,0.3)] transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Request a Demo'}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0F766E] bg-white hover:bg-[#0F766E] text-[#0F766E] hover:text-white font-bold text-sm px-5 py-3 transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <p className="pt-0.5 text-sm text-[#52666B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" aria-hidden="true" />
          Your enquiry is confidential and reviewed directly by the Trust Logistic team.
        </p>
      </form>
    </div>
  );
}
