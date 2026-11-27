'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Headphones, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactQuery } from '@/app/(public)/actions';
import { FieldError } from '@/components/public/FieldError';

export function ContactForm() {
  const [inquiryType, setInquiryType] = useState<'sales' | 'support'>('sales');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phone: '',
    companyName: '',
    message: '',
    website: '', // Honeypot
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail.trim()))
      errs.workEmail = 'Enter a valid email address';
    if (formData.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContactQuery({ ...formData, inquiryType });
      if (!res.success) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setFormError(res.error || 'Could not send message.');
        toast.error(res.error || 'Could not send message.');
        return;
      }

      setSent(true);
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        phone: '',
        companyName: '',
        message: '',
        website: '',
      });
      toast.success('Message received! Our team will respond shortly.');
    } catch {
      setFormError('Network error while sending message.');
      toast.error('Network error while sending message.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full h-12 rounded-xl border bg-[#F3F7F7]/65 px-4 text-sm font-medium text-[#06262A] placeholder:text-[#52666B]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 focus:border-[#0F766E] transition-colors';

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-10 border border-[#0F766E]/12 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#06262A] tracking-tight">
        Send an Enquiry
      </h2>
      <p className="mt-1.5 text-sm text-[#52666B] mb-6">
        Select whether you are looking for a product enquiry or customer support.
      </p>

      {/* Sales Enquiry vs Customer Support Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-7" role="group" aria-label="Enquiry type">
        <button
          type="button"
          onClick={() => setInquiryType('sales')}
          aria-pressed={inquiryType === 'sales'}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-bold border transition-colors cursor-pointer ${
            inquiryType === 'sales'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-[#F3F7F7] text-[#06262A] border-[#0F766E]/15 hover:border-[#0F766E]/40'
          }`}
        >
          <Briefcase className="w-4 h-4" aria-hidden="true" />
          Sales Enquiry
        </button>

        <button
          type="button"
          onClick={() => setInquiryType('support')}
          aria-pressed={inquiryType === 'support'}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-bold border transition-colors cursor-pointer ${
            inquiryType === 'support'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-[#F3F7F7] text-[#06262A] border-[#0F766E]/15 hover:border-[#0F766E]/40'
          }`}
        >
          <Headphones className="w-4 h-4" aria-hidden="true" />
          Customer Support
        </button>
      </div>

      {sent && (
        <div
          role="status"
          className="mb-6 rounded-2xl bg-[#F0FDF4] border border-[#0F766E]/30 p-4 text-sm font-semibold text-[#0A4F4A] flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" aria-hidden="true" />
          <span>Thank you! Your message has been saved and our team will reach back out.</span>
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Honeypot field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-website-hp">Website</label>
          <input
            id="contact-website-hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-firstName" className="block text-sm font-bold text-[#06262A] mb-1.5">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              id="c-firstName"
              name="firstName"
              type="text"
              required
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.firstName ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.firstName} />
          </div>

          <div>
            <label htmlFor="c-lastName" className="block text-sm font-bold text-[#06262A] mb-1.5">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              id="c-lastName"
              name="lastName"
              type="text"
              required
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.lastName ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.lastName} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="c-email" className="block text-sm font-bold text-[#06262A] mb-1.5">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              id="c-email"
              name="workEmail"
              type="email"
              required
              placeholder="you@company.in"
              value={formData.workEmail}
              onChange={handleChange}
              className={`${inputBase} ${fieldErrors.workEmail ? 'border-red-500' : 'border-[#0F766E]/25'}`}
            />
            <FieldError message={fieldErrors.workEmail} />
          </div>

          <div>
            <label htmlFor="c-phone" className="block text-sm font-bold text-[#06262A] mb-1.5">
              Phone Number
            </label>
            <input
              id="c-phone"
              name="phone"
              type="tel"
              placeholder="+91 98XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className={`${inputBase} border-[#0F766E]/25`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="c-company" className="block text-sm font-bold text-[#06262A] mb-1.5">
            Company Name
          </label>
          <input
            id="c-company"
            name="companyName"
            type="text"
            placeholder="Your Transport Company"
            value={formData.companyName}
            onChange={handleChange}
            className={`${inputBase} border-[#0F766E]/25`}
          />
        </div>

        <div>
          <label htmlFor="c-message" className="block text-sm font-bold text-[#06262A] mb-1.5">
            {inquiryType === 'support' ? 'Describe your support issue' : 'How can we help?'}{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="c-message"
            name="message"
            rows={4}
            required
            placeholder={
              inquiryType === 'support'
                ? 'Share your company name, branch code and issue details...'
                : 'Tell us about your transport branches, fleet size or pricing questions...'
            }
            value={formData.message}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-[#F3F7F7]/65 p-4 text-sm font-medium text-[#06262A] placeholder:text-[#52666B]/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 focus:border-[#0F766E] transition-colors ${
              fieldErrors.message ? 'border-red-500' : 'border-[#0F766E]/25'
            }`}
          />
          <FieldError message={fieldErrors.message} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-[#06262A] font-extrabold text-base px-6 py-4 shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          {submitting
            ? 'Sending...'
            : inquiryType === 'support'
            ? 'Submit Support Request'
            : 'Send Sales Enquiry'}
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
